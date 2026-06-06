import { useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import AdminLayout from "../../components/layout/AdminLayout";

interface TranscriptSegment {
  text: string;
  start: number;
  timestamp: string;
}

interface TranscriptResult {
  videoId: string;
  text: string;
  wordCount: number;
  segmentCount: number;
  segments: TranscriptSegment[];
  title?: string;
  channelName?: string;
  duration?: number;
}

const YouTubeImport = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TranscriptResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"text" | "segments">("text");

  const isValidYoutubeUrl = (val: string) =>
    /(?:youtube\.com\/(?:watch\?.*v=|shorts\/)|youtu\.be\/)/.test(val);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await axiosInstance.post("/admin/youtube-transcript", { url: url.trim() });
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch transcript. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setUrl("");
    setResult(null);
    setError("");
  };

  const thumbnailUrl = result
    ? `https://img.youtube.com/vi/${result.videoId}/hqdefault.jpg`
    : null;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">YouTube Import</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Extract transcript from any YouTube cooking video
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Step 1 of 3 — Transcript
        </span>
      </div>

      {/* Pipeline Steps */}
      <div className="flex items-center gap-0 mb-8">
        {[
          { num: 1, label: "Get Transcript", active: true, done: !!result },
          { num: 2, label: "AI Parse Recipe", active: false, done: false },
          { num: 3, label: "Save to DB", active: false, done: false },
        ].map((step, i, arr) => (
          <div key={step.num} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              step.done
                ? "bg-green-50 text-green-700"
                : step.active
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-400"
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                step.done ? "bg-green-500 text-white" : step.active ? "bg-white text-black" : "bg-gray-300 text-gray-500"
              }`}>
                {step.done ? "✓" : step.num}
              </div>
              {step.label}
            </div>
            {i < arr.length - 1 && (
              <div className={`w-8 h-px mx-1 ${step.done ? "bg-green-300" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Input */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h3 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-base">▶</span>
              Paste YouTube URL
            </h3>

            <form onSubmit={handleFetch} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Video URL</label>
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(""); }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-gray-800 transition-colors placeholder:text-gray-300"
                    required
                  />
                  {url && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* URL Preview Indicator */}
                {url && (
                  <p className={`text-xs mt-1.5 flex items-center gap-1 ${isValidYoutubeUrl(url) ? "text-green-600" : "text-amber-600"}`}>
                    {isValidYoutubeUrl(url) ? "✓ Valid YouTube URL" : "⚠ Enter a valid YouTube URL"}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                  <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !url || !isValidYoutubeUrl(url)}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Fetching transcript...
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    Get Transcript
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick tips */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-2">💡 Tips for best results</p>
            <ul className="text-xs text-amber-600 space-y-1">
              <li>• Use videos that have <strong>auto-captions or subtitles</strong> enabled</li>
              <li>• Tamil & Hindi cooking channel videos usually have auto-subtitles</li>
              <li>• Shorts, Reels and Private videos may not have transcripts</li>
              <li>• Copy the transcript, then use it in AI Parse (Step 2)</li>
            </ul>
          </div>
        </div>

        {/* Right Panel: Result */}
        <div>
          {!result && !loading && (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-3xl">📋</div>
              <p className="text-sm font-medium text-gray-500">Transcript will appear here</p>
              <p className="text-xs text-gray-400 mt-1">Paste a YouTube URL and click Get Transcript</p>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-gray-100 rounded-2xl h-full min-h-[300px] flex flex-col items-center justify-center p-8 gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-2xl">▶</div>
                <div className="absolute inset-0 rounded-2xl border-2 border-red-300 animate-ping" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Fetching transcript...</p>
                <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
              </div>
              <div className="flex gap-1.5 mt-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              {/* Video Thumbnail */}
              {thumbnailUrl && (
                <div className="relative">
                  <img
                    src={thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-xs font-medium flex items-center gap-1.5 hover:underline"
                    >
                      <span className="text-sm">▶</span>
                      {url.slice(0, 50)}...
                    </a>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
                {[
                  { label: "Words", value: result.wordCount.toLocaleString() },
                  { label: "Segments", value: result.segmentCount.toLocaleString() },
                  { label: "Channel", value: result.channelName || "—" },
                  { label: "Status", value: "✓ Ready" },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center py-3 px-1">
                    <p className="text-[10px] text-gray-400">{label}</p>
                    <p className="text-xs font-semibold text-black truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Transcript */}
              <div className="p-4">
                {/* View Toggle */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setViewMode("text")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        viewMode === "text" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Full Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("segments")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        viewMode === "segments" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Segments {result.segmentCount > 0 && `(${result.segmentCount})`}
                    </button>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg transition-all ${
                      copied
                        ? "bg-green-50 text-green-600 border border-green-200"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {copied ? (
                      <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> Copied!</>
                    ) : (
                      <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copy</>
                    )}
                  </button>
                </div>

                {/* Full Text View */}
                {viewMode === "text" && (
                  <div className="bg-gray-50 rounded-xl p-3 max-h-64 overflow-y-auto">
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{result.text}</p>
                  </div>
                )}

                {/* Segments View */}
                {viewMode === "segments" && (
                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {result.segments.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-8">No segment data available</p>
                    ) : result.segments.map((seg, i) => (
                      <div key={i} className="flex gap-3 items-start bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-[10px] text-gray-400 font-mono bg-white border border-gray-100 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                          {seg.timestamp || `${Math.floor(seg.start / 60)}:${String(Math.floor(seg.start % 60)).padStart(2, "0")}`}
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed">{seg.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleClear}
                    className="flex-1 py-2 text-xs font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Try Another URL
                  </button>
                  <button
                    disabled
                    className="flex-1 py-2 text-xs font-medium bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed"
                    title="Coming in Step 2"
                  >
                    AI Parse → Step 2 (Soon)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default YouTubeImport;
