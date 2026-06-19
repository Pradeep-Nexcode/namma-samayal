import {
  baseTemplate,
  emailButton,
  emailInfoCard,
  emailInlineLink,
} from "./baseTemplate.js";

export const verifyEmailTemplate = (
  link: string,
  heroImageUrl?: string,
): string => {
  const content = `
    <p style="margin:0 0 12px;font-family:inherit;font-size:17px;font-weight:700;color:#3a2a1e;">
      Vanakkam 👋
    </p>
    <p style="margin:0 auto;max-width:440px;">
      Welcome to Namma Samayal! You're one step away from discovering authentic
      Tamil recipes. Please confirm your email address to activate your account.
    </p>
    ${emailButton("Verify my email", link, "🌿")}
    ${emailInfoCard([
      {
        emoji: "⏳",
        html: "This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.",
      },
      {
        emoji: "🔗",
        html: `If the button doesn't work, copy and paste this link into your browser:<br />${emailInlineLink(link)}`,
      },
    ])}
  `;

  return baseTemplate("Verify your account", content, {
    preheader: "Confirm your email to activate your Namma Samayal account.",
    heroImageUrl,
  });
};
