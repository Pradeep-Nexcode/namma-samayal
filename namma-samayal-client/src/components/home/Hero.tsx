"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background Image with subtle texture */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute inset-0 opacity-15"
      >
        <Image
          src="/images/main-hero.png"
          alt="Traditional South Indian meals background texture"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      {/* Dynamic Glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-secondary/10 blur-[100px]" />
      
      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row items-center justify-between px-6 lg:px-12 mx-auto w-full max-w-7xl pt-24 pb-12 lg:py-0">
        
        {/* Left Side: Copy */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="w-full lg:w-[55%] flex flex-col items-start text-left space-y-8"
        >
          {/* Tag */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.8, ease }}
            className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
              The Food Knowledge Platform
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 1, ease }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] pb-2"
          >
            Explore Food Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Recipes, Ingredients</span> & Regions
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.9, ease }}
            className="max-w-xl text-base sm:text-lg text-textSecondary leading-relaxed"
          >
            A structured knowledge system for traditional cooking. Discover how a single dish transforms across regions, and dive deep into every ingredient&apos;s unique story.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.8, ease }}
            className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto"
          >
            <Link
              href="/recipes"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-primary px-8 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(231,76,60,0.6)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Recipes
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>
            
            <Link
              href="/ingredients"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:scale-105"
            >
              Discover Ingredients
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Side: Interactive Knowledge Graph Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease }}
          className="w-full lg:w-[45%] relative h-[500px] lg:h-[700px] mt-16 lg:mt-0"
        >
          {/* Central Recipe Card */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="w-64 rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl p-5 shadow-2xl shadow-black/50">
              <div className="w-full h-32 rounded-xl bg-gradient-to-br from-primary/20 to-black overflow-hidden relative mb-4">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
                <Image src="/images/main-hero.png" alt="Recipe" fill className="object-cover opacity-60 mix-blend-luminosity" />
              </div>
              <h3 className="text-white font-medium text-lg">Traditional Sambar</h3>
              <p className="text-textSecondary text-sm mt-1 mb-3">Authentic Kongu style preparation</p>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 rounded bg-secondary/10 text-secondary border border-secondary/20">Recipe</span>
                <span className="text-xs px-2 py-1 rounded bg-white/5 text-textSecondary border border-white/10">30 mins</span>
              </div>
            </div>
          </motion.div>

          {/* Connecting Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none hidden sm:block" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.1))" }}>
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 2, delay: 1, ease }}
              d="M 50% 50% Q 20% 30% 25% 20%" 
              stroke="url(#grad1)" strokeWidth="2" fill="none" strokeDasharray="4 4" 
            />
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 2, delay: 1.5, ease }}
              d="M 50% 50% Q 80% 40% 75% 25%" 
              stroke="url(#grad2)" strokeWidth="2" fill="none" strokeDasharray="4 4" 
            />
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 2, delay: 2, ease }}
              d="M 50% 50% Q 55% 80% 40% 80%" 
              stroke="url(#grad1)" strokeWidth="2" fill="none" strokeDasharray="4 4" 
            />
            
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-secondary)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>

          {/* Region Node */}
          <motion.div
            initial={{ opacity: 0, x: -20, y: -20 }}
            animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
            transition={{ 
              opacity: { duration: 0.8, delay: 1.2 }, 
              x: { duration: 0.8, delay: 1.2 },
              y: { duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1.2 } 
            }}
            className="absolute top-[8%] left-[8%] sm:left-[5%] z-20 hidden sm:block"
          >
            <div className="flex items-center gap-3 rounded-full border border-primary/30 bg-card/60 backdrop-blur-md p-2 pr-5 shadow-[0_0_20px_rgba(231,76,60,0.15)] cursor-pointer hover:bg-card/80 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-secondary text-xs uppercase tracking-wider font-semibold">Region</p>
                <p className="text-white text-sm font-medium">Kongu Nadu</p>
              </div>
            </div>
          </motion.div>

          {/* Ingredient Node 1 */}
          <motion.div
            initial={{ opacity: 0, x: 20, y: -20 }}
            animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
            transition={{ 
              opacity: { duration: 0.8, delay: 1.7 }, 
              x: { duration: 0.8, delay: 1.7 },
              y: { duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 } 
            }}
            className="absolute top-[12%] right-[5%] z-20 group hidden sm:block"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card/80 backdrop-blur-md p-3 shadow-xl transition-all hover:border-secondary/50 hover:shadow-[0_0_25px_rgba(244,196,48,0.2)] cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-white/5">
                <span className="text-xl">🧅</span>
              </div>
              <div>
                <p className="text-secondary text-[10px] sm:text-xs uppercase tracking-wider font-semibold group-hover:text-primary transition-colors">Ingredient</p>
                <p className="text-white text-sm font-medium leading-tight">Small Onions</p>
              </div>
            </div>
          </motion.div>

          {/* Ingredient Node 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -6, 0] }}
            transition={{ 
              opacity: { duration: 0.8, delay: 2.2 }, 
              y: { duration: 3.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1.8 } 
            }}
            className="absolute bottom-[10%] sm:bottom-[15%] left-[10%] sm:left-[20%] z-20 group hidden sm:block"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card/80 backdrop-blur-md p-3 shadow-xl transition-all hover:border-primary/50 hover:shadow-[0_0_25px_rgba(231,76,60,0.2)] cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-600/20 flex items-center justify-center border border-white/5">
                <span className="text-xl">🌶️</span>
              </div>
              <div>
                <p className="text-secondary text-[10px] sm:text-xs uppercase tracking-wider font-semibold group-hover:text-primary transition-colors">Ingredient</p>
                <p className="text-white text-sm font-medium leading-tight">Byadgi Chilli</p>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
