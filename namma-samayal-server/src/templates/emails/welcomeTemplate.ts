import { baseTemplate, emailButton, emailFeatureRow } from "./baseTemplate.js";

/** Sent right after a user successfully verifies their email. */
export const welcomeTemplate = (
  firstName: string,
  exploreLink: string,
  heroImageUrl?: string,
): string => {
  const content = `
    <p style="margin:0 0 12px;font-family:inherit;font-size:17px;font-weight:700;color:#3a2a1e;">
      Vanakkam ${firstName} 👋
    </p>
    <p style="margin:0 auto;max-width:440px;">
      Your account is now verified — welcome to the Namma Samayal community!
      Start exploring authentic Tamil recipes, save your favourites, and cook
      something special today.
    </p>
    ${emailButton("Explore Recipes", exploreLink, "🍲")}
    ${emailFeatureRow([
      {
        emoji: "❤️",
        title: "Save Favorites",
        desc: "Keep your loved recipes in one place",
        badgeBg: "#fae3df",
      },
      {
        emoji: "🧑‍🍳",
        title: "Easy Cooking",
        desc: "Step-by-step recipes in your language",
        badgeBg: "#e4efd8",
      },
      {
        emoji: "👥",
        title: "Join Community",
        desc: "Share & discover traditional recipes",
        badgeBg: "#fbe6cf",
      },
    ])}
  `;

  return baseTemplate("You're all set!", content, {
    preheader: "Your Namma Samayal account is verified. Start exploring recipes!",
    heroImageUrl,
  });
};
