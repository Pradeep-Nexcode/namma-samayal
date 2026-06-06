import axios from "axios";
import { Request, Response } from "express";

import config from "../config/config.js";
import { getYoutubeId } from "../utils/getYoutubeId.js";
import { logger } from "../utils/logger.js";

const SOCIALKIT_TRANSCRIPT_URL = "https://api.socialkit.dev/youtube/transcript";

interface TranscriptSegment {
  text: string;
  start: number;
  timestamp: string;
}

interface SocialKitResponse {
  success: boolean;
  data: {
    transcript: string;
    transcriptSegments: TranscriptSegment[];
    title?: string;
    duration?: number;
    channelName?: string;
    viewCount?: number;
  };
  message?: string;
}

export const getYoutubeTranscript = async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ success: false, message: "YouTube URL is required" });
    return;
  }

  const videoId = getYoutubeId(url.trim());

  if (!videoId) {
    res.status(400).json({
      success: false,
      message: "Invalid YouTube URL. Could not extract video ID.",
    });
    return;
  }

  if (!config.socialkitApiKey) {
    res.status(500).json({
      success: false,
      message: "SocialKit API key is not configured. Add SOCIALKIT_API_KEY to your .env file.",
    });
    return;
  }

  try {
    logger.info("Fetching transcript via SocialKit", { videoId });

    const response = await axios.get<SocialKitResponse>(SOCIALKIT_TRANSCRIPT_URL, {
      params: {
        access_key: config.socialkitApiKey,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      },
      timeout: 20000,
    });

    const data = response.data?.data;

    if (!data?.transcript) {
      res.status(404).json({
        success: false,
        message: "No transcript available for this video. It may not have captions enabled.",
      });
      return;
    }

    logger.info("Transcript fetched via SocialKit", {
      videoId,
      wordCount: data.transcript.split(" ").length,
      segmentCount: data.transcriptSegments?.length ?? 0,
    });

    res.status(200).json({
      success: true,
      data: {
        videoId,
        text: data.transcript,
        segments: data.transcriptSegments ?? [],
        wordCount: data.transcript.split(" ").length,
        segmentCount: data.transcriptSegments?.length ?? 0,
        // Extra metadata if SocialKit provides it
        title: data.title,
        channelName: data.channelName,
        duration: data.duration,
      },
    });
  } catch (error: any) {
    const status = error.response?.status;
    const apiMessage = error.response?.data?.message;

    logger.error("SocialKit transcript fetch failed", {
      videoId,
      status,
      apiMessage,
      error: error.message,
    });

    if (status === 401 || status === 403) {
      res.status(500).json({
        success: false,
        message: "Invalid SocialKit API key. Check your SOCIALKIT_API_KEY in .env.",
      });
      return;
    }

    if (status === 429) {
      res.status(429).json({
        success: false,
        message: "SocialKit API rate limit reached. Please wait and try again.",
      });
      return;
    }

    res.status(422).json({
      success: false,
      message: apiMessage || "Failed to fetch transcript. The video may be private, unavailable, or have no captions.",
    });
  }
};
