import { Router } from "express";

import { resetPasswordTemplate } from "../templates/emails/resetPasswordTemplate.js";
import { verifyEmailTemplate } from "../templates/emails/verifyEmailTemplate.js";
import { welcomeTemplate } from "../templates/emails/welcomeTemplate.js";

/**
 * Dev-only routes for previewing email templates in the browser.
 * Mounted only when NODE_ENV !== "production" (see routes/index.ts).
 *
 *   http://localhost:<PORT>/api/dev/emails            → index of all templates
 *   http://localhost:<PORT>/api/dev/emails/verify     → verification email
 *   http://localhost:<PORT>/api/dev/emails/reset      → password reset email
 *   http://localhost:<PORT>/api/dev/emails/welcome    → welcome email
 */
const router = Router();

const SAMPLE = {
  verifyLink: "https://nammasamayal.com/auth/verify-email?token=demo-token-123",
  resetLink: "https://nammasamayal.com/auth/reset-password?token=demo-token-123",
  exploreLink: "https://nammasamayal.com/recipes",
  firstName: "Pradeep",
};

const previews: Record<string, (hero?: string) => string> = {
  verify: (hero) => verifyEmailTemplate(SAMPLE.verifyLink, hero),
  reset: (hero) => resetPasswordTemplate(SAMPLE.resetLink, hero),
  welcome: (hero) => welcomeTemplate(SAMPLE.firstName, SAMPLE.exploreLink, hero),
};

router.get("/emails", (_req, res) => {
  const links = Object.keys(previews)
    .map(
      (key) =>
        `<li style="margin:8px 0;"><a href="/api/dev/emails/${key}" style="font-family:sans-serif;font-size:16px;color:#c0392b;">${key} email</a></li>`,
    )
    .join("");

  res.send(
    `<div style="font-family:sans-serif;padding:40px;">
      <h1>Email template previews</h1>
      <ul>${links}</ul>
    </div>`,
  );
});

router.get("/emails/:template", (req, res) => {
  const render = previews[req.params.template];

  if (!render) {
    res.status(404).send("Unknown template. Try /api/dev/emails");
    return;
  }

  // Optional ?hero=<absolute-url> to preview the food hero image band.
  const hero = typeof req.query.hero === "string" ? req.query.hero : undefined;

  res.send(render(hero));
});

export default router;
