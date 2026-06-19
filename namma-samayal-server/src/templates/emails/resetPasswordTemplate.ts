import {
  baseTemplate,
  emailButton,
  emailInfoCard,
  emailInlineLink,
} from "./baseTemplate.js";

export const resetPasswordTemplate = (
  link: string,
  heroImageUrl?: string,
): string => {
  const content = `
    <p style="margin:0 auto;max-width:440px;">
      We received a request to reset the password for your Namma Samayal account.
      Click the button below to choose a new password.
    </p>
    ${emailButton("Reset my password", link, "🔑")}
    ${emailInfoCard([
      {
        emoji: "⏳",
        html: "This link expires in <strong>1 hour</strong>. If you didn't request a reset, you can safely ignore this email — your password won't change.",
      },
      {
        emoji: "🔗",
        html: `If the button doesn't work, copy and paste this link into your browser:<br />${emailInlineLink(link)}`,
      },
    ])}
  `;

  return baseTemplate("Reset your password", content, {
    preheader: "Reset your Namma Samayal password. Link valid for 1 hour.",
    heroImageUrl,
  });
};
