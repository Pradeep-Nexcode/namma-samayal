import { Resend } from "resend";

import config from "../config/config.js";
import { resetPasswordTemplate } from "../templates/emails/resetPasswordTemplate.js";
import { verifyEmailTemplate } from "../templates/emails/verifyEmailTemplate.js";
import { welcomeTemplate } from "../templates/emails/welcomeTemplate.js";
import { logger } from "../utils/logger.js";

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

/** Canonical frontend base URL (first configured origin). */
const frontendBaseUrl = config.frontendUrls[0];

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

/**
 * Low-level send. In dev (no RESEND_API_KEY) we log the email instead of
 * sending, so the verify/reset flow is testable without Resend configured.
 */
const sendEmail = async ({ to, subject, html }: SendEmailArgs): Promise<void> => {
  if (!resend) {
    logger.info("Email (dev mode, not sent)", { to, subject, html });
    return;
  }

  const { error } = await resend.emails.send({
    from: config.emailFrom,
    to,
    subject,
    html,
  });

  if (error) {
    logger.error("Failed to send email", { to, subject, error });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const sendVerificationEmail = async (
  to: string,
  rawToken: string,
): Promise<void> => {
  const verifyUrl = `${frontendBaseUrl}/auth/verify-email?token=${rawToken}`;

  await sendEmail({
    to,
    subject: "Verify your Namma Samayal account",
    html: verifyEmailTemplate(verifyUrl, config.emailHeroUrl || undefined),
  });
};

export const sendPasswordResetEmail = async (
  to: string,
  rawToken: string,
): Promise<void> => {
  const resetUrl = `${frontendBaseUrl}/auth/reset-password?token=${rawToken}`;

  await sendEmail({
    to,
    subject: "Reset your Namma Samayal password",
    html: resetPasswordTemplate(resetUrl, config.emailHeroUrl || undefined),
  });
};

export const sendWelcomeEmail = async (
  to: string,
  firstName: string,
): Promise<void> => {
  const exploreUrl = `${frontendBaseUrl}/recipes`;

  await sendEmail({
    to,
    subject: "Welcome to Namma Samayal 🍛",
    html: welcomeTemplate(firstName, exploreUrl, config.emailHeroUrl || undefined),
  });
};
