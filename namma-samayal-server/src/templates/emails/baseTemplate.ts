/**
 * Master email layout for all Namma Samayal transactional emails.
 *
 * Matches the approved design: terracotta brand header (bilingual, optional
 * spice watermark) → gold wave divider → full-width food hero → centered body
 * (ornament + handwritten heading + gold divider + content) → warm footer with
 * botanical art, social badges and taglines.
 *
 * Email clients (Gmail, Outlook, Apple Mail) have poor CSS support, so this is
 * table-based with inline styles only — no flexbox, grid, or <style> blocks.
 * Icons are emoji (no hosting). The decorative graphics (wave, watermark,
 * footer art) are OPTIONAL hosted images set via EMAIL_*_URL env vars; each
 * degrades gracefully when unset. Brand fonts load via the <link> below and
 * render in Apple Mail/iOS; Gmail/Outlook fall back to the sans stacks.
 *
 * To re-skin, edit ONLY the emailTheme tokens.
 */
import config from "../../config/config.js";

export const emailTheme = {
  pageBg: "#f4ead8", // warm cream page background
  card: "#ffffff",
  headerFrom: "#a83a28", // terracotta header gradient start
  headerTo: "#8f2f20", // terracotta header gradient end (Outlook fallback)
  heading: "#3a2a1e", // dark brown headings
  primary: "#c0392b", // button base red
  accent: "#d99b2e", // gold dividers
  accentSoft: "#f6e6c8", // gold/cream badge background
  text: "#5c5046", // warm body text
  muted: "#8a7d70",
  soft: "#a89a8b",
  border: "#eee2cf", // warm border
  infoBg: "#fbf4e7", // info/feature card background
  footerBg: "#f5ead6", // footer band
  onHeaderSoft: "#f0c97a", // saffron tagline on header
} as const;

const FONT = "'Nunito','Segoe UI',Helvetica,Arial,sans-serif"; // body
const FONT_HW = "'Patrick Hand','Segoe UI',Arial,sans-serif"; // headings / wordmark
const FONT_UI = "'Poppins','Segoe UI',Helvetica,Arial,sans-serif"; // buttons / labels

/** Update these to your real social/handles before launch. */
const SOCIAL_LINKS = {
  website: "https://nammasamayal.com",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  youtube: "https://youtube.com",
};

/** Optional hosted decorative graphics (see EMAIL_*_URL env vars). */
const ASSETS = {
  wave: config.emailWaveUrl,
  watermark: config.emailWatermarkUrl,
  footerLeft: config.emailFooterArtLeftUrl,
  footerRight: config.emailFooterArtRightUrl,
};

interface BaseTemplateOptions {
  /** Hidden inbox-preview text shown after the subject in most clients. */
  preheader?: string;
  /** Absolute https URL to a food hero image. Omit to show only the band. */
  heroImageUrl?: string;
}

const socialBadge = (label: string, emoji: string, url: string): string => `
  <a href="${url}" target="_blank" style="text-decoration:none;">
    <span style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;background-color:#2b2b2b;color:#ffffff;border-radius:50%;font-size:15px;margin:0 5px;" aria-label="${label}">${emoji}</span>
  </a>`;

export const baseTemplate = (
  title: string,
  content: string,
  options: BaseTemplateOptions = {},
): string => {
  const { preheader = "", heroImageUrl } = options;
  const year = new Date().getFullYear();

  const watermarkBg = ASSETS.watermark
    ? `background-image:linear-gradient(135deg, ${emailTheme.headerFrom}, ${emailTheme.headerTo}), url('${ASSETS.watermark}');background-size:cover, cover;background-position:center;`
    : `background-image:linear-gradient(135deg, ${emailTheme.headerFrom}, ${emailTheme.headerTo});`;

  // Gold wave divider — hosted image if provided, else a solid gold band.
  const waveRow = ASSETS.wave
    ? `<tr><td style="padding:0;font-size:0;line-height:0;background-color:${emailTheme.headerTo};">
         <img src="${ASSETS.wave}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
       </td></tr>`
    : `<tr><td style="height:6px;background-color:${emailTheme.accent};font-size:0;line-height:0;">&nbsp;</td></tr>`;

  const heroRow = heroImageUrl
    ? `<tr>
        <td style="padding:0;background-color:${emailTheme.headerTo};font-size:0;line-height:0;">
          <img src="${heroImageUrl}" width="600" alt="Namma Samayal" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;" />
        </td>
      </tr>`
    : "";

  const footerArtLeft = ASSETS.footerLeft
    ? `<img src="${ASSETS.footerLeft}" width="90" alt="" style="position:absolute;left:8px;bottom:8px;width:90px;height:auto;opacity:0.9;border:0;" />`
    : "";
  const footerArtRight = ASSETS.footerRight
    ? `<img src="${ASSETS.footerRight}" width="100" alt="" style="position:absolute;right:8px;bottom:8px;width:100px;height:auto;opacity:0.9;border:0;" />`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Nunito:wght@400;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:${emailTheme.pageBg};">
  ${
    preheader
      ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${emailTheme.pageBg};font-size:1px;line-height:1px;">${preheader}</div>`
      : ""
  }
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${emailTheme.pageBg};padding:28px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${emailTheme.card};border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(120,60,30,0.14);">

          <!-- Brand header (bilingual, optional spice watermark) -->
          <tr>
            <td style="${watermarkBg}padding:26px 34px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle" style="padding-right:10px;">
                    <p style="margin:0;font-family:${FONT_HW};font-size:30px;font-weight:700;color:#ffffff;letter-spacing:0.4px;">
                      🍲 Namma Samayal
                    </p>
                    <p style="margin:5px 0 0;font-family:${FONT_UI};font-size:13px;font-weight:600;color:${emailTheme.onHeaderSoft};letter-spacing:0.3px;">
                      Authentic Tamil Recipes
                    </p>
                    <p style="margin:2px 0 0;font-family:${FONT};font-size:13px;color:#ffffff;">
                      நம்ம சமையல்
                    </p>
                  </td>
                  <td valign="middle" align="right" style="font-family:${FONT};font-size:12.5px;color:${emailTheme.onHeaderSoft};white-space:nowrap;">
                    சுவை பாரம்பரியம், நம்ம கலாசாரம்
                    <div style="margin-top:6px;height:2px;width:70px;background-color:${emailTheme.accent};margin-left:auto;border-radius:2px;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${waveRow}
          ${heroRow}

          <!-- Body -->
          <tr>
            <td style="padding:34px 40px 8px;text-align:center;">
              <!-- Ornament: leaf · bowl · leaf -->
              <p style="margin:0 0 10px;font-size:18px;line-height:1;color:${emailTheme.accent};">🌿&nbsp;&nbsp;🍲&nbsp;&nbsp;🌿</p>

              <h1 style="margin:0;font-family:${FONT_HW};font-size:32px;font-weight:700;color:${emailTheme.heading};letter-spacing:0.3px;">
                ${title}
              </h1>

              <!-- Gold flourish divider -->
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:14px auto 22px;">
                <tr>
                  <td style="width:46px;height:3px;background-color:${emailTheme.accent};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
                  <td style="padding:0 7px;font-size:12px;color:${emailTheme.accent};line-height:1;">&bull;</td>
                  <td style="width:46px;height:3px;background-color:${emailTheme.accent};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <div style="font-family:${FONT};font-size:15px;line-height:1.65;color:${emailTheme.text};">
                ${content}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="position:relative;background-color:${emailTheme.footerBg};padding:26px 40px 28px;text-align:center;">
              ${footerArtLeft}
              ${footerArtRight}
              <p style="margin:0 0 4px;font-family:${FONT};font-size:14px;font-weight:600;color:${emailTheme.text};">
                Thanks for being part of Namma Samayal! ❤️
              </p>
              <p style="margin:0 0 12px;font-family:${FONT_HW};font-size:17px;color:${emailTheme.heading};">
                Happy Cooking!
              </p>
              <div style="height:2px;width:54px;background-color:${emailTheme.accent};margin:0 auto 14px;border-radius:2px;"></div>
              <div style="margin-bottom:14px;">
                ${socialBadge("Facebook", "f", SOCIAL_LINKS.facebook)}
                ${socialBadge("Instagram", "◎", SOCIAL_LINKS.instagram)}
                ${socialBadge("YouTube", "▶", SOCIAL_LINKS.youtube)}
              </div>
              <p style="margin:0;font-family:${FONT_UI};font-size:11.5px;color:${emailTheme.soft};">
                &copy; ${year} Namma Samayal. All rights reserved.
              </p>
              <p style="margin:4px 0 0;font-family:${FONT};font-size:11.5px;font-style:italic;color:${emailTheme.soft};">
                Traditional recipes. Timeless taste.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Bulletproof CTA button (table cell + padded anchor) so it renders solidly in
 * Outlook, which ignores padding/border-radius on bare anchors.
 */
export const emailButton = (label: string, url: string, emoji = ""): string => {
  const icon = emoji ? `${emoji}&nbsp;&nbsp;` : "";
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:26px auto;">
    <tr>
      <td align="center" bgcolor="${emailTheme.primary}" style="border-radius:12px;box-shadow:0 8px 18px rgba(192,57,43,0.32);">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:16px 40px;font-family:${FONT_UI};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:0.3px;background-color:${emailTheme.primary};background-image:linear-gradient(180deg, #e35749 0%, ${emailTheme.primary} 55%, #a82f22 100%);border-top:1px solid rgba(255,255,255,0.28);">
          ${icon}${label}
        </a>
      </td>
    </tr>
  </table>`;
};

/**
 * Three-column feature row with circular emoji badges (matches the design's
 * "Save Favorites / Easy Cooking / Join Community" block).
 */
export const emailFeatureRow = (
  features: Array<{ emoji: string; title: string; desc: string; badgeBg?: string }>,
): string => {
  const cells = features
    .map(
      (f, i) => `
      <td width="33%" valign="top" align="center" style="padding:4px 10px;${
        i > 0 ? `border-left:1px solid ${emailTheme.border};` : ""
      }">
        <span style="display:inline-block;width:42px;height:42px;line-height:42px;text-align:center;background-color:${f.badgeBg ?? emailTheme.accentSoft};border-radius:50%;font-size:19px;margin-bottom:8px;">${f.emoji}</span>
        <p style="margin:0 0 3px;font-family:${FONT_UI};font-size:13.5px;font-weight:700;color:${emailTheme.heading};">${f.title}</p>
        <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.45;color:${emailTheme.muted};">${f.desc}</p>
      </td>`,
    )
    .join("");

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 6px;background-color:${emailTheme.infoBg};border:1px solid ${emailTheme.border};border-radius:14px;">
    <tr><td style="padding:20px 12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table></td></tr>
  </table>`;
};

/**
 * Bordered info card with one or more icon + text rows (dashed divider between
 * rows). Used for expiry / fallback-link notes on the verify & reset emails.
 */
export const emailInfoCard = (
  rows: Array<{ emoji: string; html: string }>,
): string => {
  const renderedRows = rows
    .map(
      (row, index) => `
      ${
        index > 0
          ? `<tr><td colspan="2" style="padding:14px 0;"><div style="border-top:1px dashed ${emailTheme.border};font-size:0;line-height:0;">&nbsp;</div></td></tr>`
          : ""
      }
      <tr>
        <td valign="top" width="44" style="padding-right:14px;">
          <span style="display:inline-block;width:38px;height:38px;line-height:38px;text-align:center;background-color:${emailTheme.accentSoft};border-radius:50%;font-size:17px;">${row.emoji}</span>
        </td>
        <td valign="middle" style="font-family:${FONT};font-size:13.5px;line-height:1.55;color:${emailTheme.muted};text-align:left;">
          ${row.html}
        </td>
      </tr>`,
    )
    .join("");

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;background-color:${emailTheme.infoBg};border:1px solid ${emailTheme.border};border-radius:12px;">
    <tr>
      <td style="padding:18px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${renderedRows}
        </table>
      </td>
    </tr>
  </table>`;
};

/** Inline link styled for the info-card fallback row. */
export const emailInlineLink = (url: string): string =>
  `<a href="${url}" target="_blank" style="color:${emailTheme.primary};word-break:break-all;text-decoration:underline;">${url}</a>`;
