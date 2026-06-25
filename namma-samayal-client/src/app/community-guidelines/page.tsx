import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Ban, Heart, MessageCircle, Sparkles, Utensils } from "lucide-react";

export const metadata: Metadata = {
  title: "Community Guidelines — Namma Samayal",
  description:
    "How we keep Kitchen Talk a warm, helpful place to share Tamil recipes and cooking tips.",
};

const GUIDELINES = [
  {
    icon: BadgeCheck,
    color: "text-emerald-500",
    title: "Be respectful and kind",
    desc: "We're all here to learn and share. Treat fellow home cooks the way you'd treat a guest in your kitchen — with warmth and patience.",
  },
  {
    icon: Ban,
    color: "text-[#d99b2e]",
    title: "No spam or promotions",
    desc: "Let's keep Kitchen Talk clean. No advertising, affiliate links, or repeated self-promotion. Genuine recipe talk only.",
  },
  {
    icon: Sparkles,
    color: "text-[#c0392b]",
    title: "Stay on topic",
    desc: "Keep comments about the recipe — tips, substitutions, results, and questions. It helps everyone who reads later.",
  },
  {
    icon: Heart,
    color: "text-rose-500",
    title: "Share your experience",
    desc: "Tried it? Tell us how it turned out, what you tweaked, and your family's verdict. Real cooking stories help the community most.",
  },
  {
    icon: MessageCircle,
    color: "text-sky-500",
    title: "Disagree gracefully",
    desc: "Every family cooks a little differently. If a recipe differs from your paati's version, share yours kindly — don't put others down.",
  },
  {
    icon: Utensils,
    color: "text-amber-600",
    title: "Help newcomers",
    desc: "Remember your first time in the kitchen. A small tip or encouragement can turn a nervous beginner into a confident cook.",
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <main
      className="min-h-screen px-4 py-12"
      style={{
        backgroundColor: "#f3ecda",
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(120,90,40,0.04) 0 1px, transparent 1px 6px)",
      }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h1 className="font-title-hw text-[40px] font-bold leading-tight text-stone-900">
            Kitchen Talk <span className="text-[#c0392b]">Guidelines</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-body text-[15px] leading-relaxed text-stone-700">
            Namma Samayal is a community kitchen. These simple rules keep it a
            warm, helpful place to share Tamil recipes, tips, and traditions. 🍛
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {GUIDELINES.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_6px_18px_-12px_rgba(120,90,40,0.3)]"
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon className={`h-5 w-5 ${color}`} />
                <h2 className="font-title-hw text-[17px] font-bold text-stone-900">
                  {title}
                </h2>
              </div>
              <p className="font-body text-[13.5px] leading-relaxed text-stone-600">
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/recipes"
            className="inline-flex items-center rounded-lg bg-[#c0392b] px-5 py-2.5 font-title-hw text-[15px] font-bold text-white transition-colors hover:bg-[#a02b1f]"
          >
            Back to recipes
          </Link>
        </div>
      </div>
    </main>
  );
}
