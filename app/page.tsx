'use client';
import React from 'react';
import { Globe as GlobeIcon, ShieldCheck, BarChart3, MapPin, LogIn, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { Globe } from './components/Globe';
import { cn } from './utils';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans selection:bg-red-100 selection:text-red-900 transition-colors duration-500 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-6 flex items-center justify-between bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex items-center justify-center size-10 bg-slate-900 dark:bg-white rounded-xl text-white dark:text-slate-900 transition-transform group-hover:scale-105">
            <Database size={20} />
          </div>
          <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">OpenClear</h2>
        </div>

        <div className="flex items-center">
          <button className="hidden sm:block px-5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Support
          </button>
        </div>
      </header>

      <main className="relative pt-32 pb-20 flex flex-col items-center">
        {/* Globe Section - Positioned behind/above title */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[700px] pointer-events-none z-0 opacity-[0.45]"
          style={{
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 90%)'
          }}
        >
          <Globe />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 mt-40">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-1.5 backdrop-blur-md shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Now powering 400+ global hubs
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-900 dark:text-white text-7xl md:text-9xl font-black tracking-tighter mb-4"
          >
            OpenClear
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-slate-400 dark:text-slate-500 text-xs md:text-sm font-medium uppercase tracking-[0.5em] mb-16 max-w-2xl leading-relaxed"
          >
            Intelligence for Seamless Global Trade
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
          >
            <button className="group flex min-w-[200px] items-center justify-center gap-3 rounded-2xl bg-slate-900 dark:bg-white px-8 py-5 text-white dark:text-slate-900 text-base font-bold shadow-2xl shadow-slate-900/20 dark:shadow-white/10 transition-all hover:-translate-y-1 hover:shadow-slate-900/30 active:translate-y-0">
              <LogIn size={20} />
              <span>Client Login</span>
            </button>
            <button className="flex min-w-[200px] items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-8 py-5 text-slate-900 dark:text-white text-base font-bold backdrop-blur-xl transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-xl active:scale-95">
              <ShieldCheck size={20} />
              <span>Request Access</span>
            </button>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-6xl px-6">
          {[
            {
              icon: <GlobeIcon className="size-8" />,
              title: "Unified Network",
              desc: "Connect carriers, ports, and customs on one single layer."
            },
            {
              icon: <ShieldCheck className="size-8" />,
              title: "Auto-Compliance",
              desc: "AI-driven document verification for zero-delay clearing."
            },
            {
              icon: <BarChart3 className="size-8" />,
              title: "Predictive Flow",
              desc: "Anticipate bottlenecks before they impact your margins."
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center gap-4 p-8 rounded-3xl bg-white/30 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-white/10 transition-colors group"
            >
              <div className="text-slate-400 dark:text-slate-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-8 flex flex-col items-center border-t border-slate-200/50 dark:border-white/5">
        <div className="flex gap-8 mb-8">
          {['Twitter', 'LinkedIn'].map((social) => (
            <a 
              key={social} 
              href="#" 
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors"
            >
              {social}
            </a>
          ))}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-600 font-medium">
          © {new Date().getFullYear()} OpenClear Logistics Intelligence. All rights reserved.
        </p>
      </footer>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-900/5 dark:bg-white/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
