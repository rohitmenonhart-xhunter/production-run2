import { motion, useScroll, useTransform } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { SparklesCore } from '@/components/ui/sparkles';
import Beam from '@/components/ui/Beam';
import { useRef } from 'react';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function MainLandingPage() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <>
      <Head>
        <title>Mockello - AI-Powered Candidate Evaluation Platform</title>
        <meta name="description" content="Transform your hiring process with Mockello - The most advanced AI-powered candidate evaluation platform that saves time and costs in recruitment" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-black min-h-screen text-white overflow-hidden">
        {/* Enhanced Animated Background with Parallax Effect */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#BE185D_0%,_transparent_35%)] opacity-20 animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_#BE185D_0%,_transparent_35%)] opacity-15 animate-pulse delay-75"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_#BE185D_0%,_transparent_35%)] opacity-15 animate-pulse delay-150"></div>
          <div className="absolute inset-0 bg-black bg-opacity-85"></div>
          
          {/* Modern Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#BE185D1A_1px,transparent_1px),linear-gradient(to_bottom,#BE185D1A_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] animate-[grid_20s_linear_infinite]"></div>
        </div>

        {/* Enhanced Navbar with Glassmorphism */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-b border-[#BE185D]/20">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] via-pink-500 to-white">
                  Mockello
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 sm:gap-6"
              >
                <Link href="https://forms.gle/Ks3Pj8RUPVpGGfBR7" className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#BE185D] to-pink-600 hover:from-pink-600 hover:to-[#BE185D] text-white transition-all duration-300 font-semibold shadow-lg shadow-[#BE185D]/25 hover:shadow-[#BE185D]/40">
                  Get Started
                </Link>
              </motion.div>
            </div>
          </div>
        </nav>

        {/* Enhanced Hero Section with 3D Transform */}
        <div ref={targetRef} className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20">
          <motion.div 
            style={{ opacity, scale }}
            className="h-[50rem] w-full flex flex-col items-center justify-center overflow-hidden px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <motion.h1 
                variants={fadeInUp}
                transition={{ duration: 0.8 }}
                className="text-7xl sm:text-8xl md:text-9xl relative z-20 text-center"
              >
                <span className="font-league-spartan font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] via-pink-500 to-white relative inline-block transform hover:scale-105 transition-transform duration-300 uppercase"
                style={{ letterSpacing: '-0.05em', fontVariationSettings: "'wght' 900" }}>
                  Mockello
                  <motion.div 
                    className="absolute -bottom-4 left-1/2 h-1 bg-gradient-to-r from-transparent via-[#BE185D] to-transparent"
                    initial={{ width: 0, x: '-50%' }}
                    animate={{ width: '90%', x: '-50%' }}
                    transition={{ 
                      duration: 1.5,
                      delay: 0.5,
                      ease: "easeInOut"
                    }}
                  />
                </span>
              </motion.h1>
              <div className="absolute -inset-2 blur-3xl bg-gradient-to-r from-[#BE185D]/20 to-pink-600/20 z-10"></div>
            </motion.div>

            <div className="w-full sm:w-[55rem] h-52 sm:h-44 relative mt-8">
              {/* Enhanced Sparkles Effect */}
              <SparklesCore
                background="transparent"
                minSize={0.8}
                maxSize={1.6}
                particleDensity={1600}
                className="w-full h-full"
                particleColor="#BE185D"
              />
              
              <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(450px_250px_at_top,transparent_30%,white)]"></div>
            </div>

            <div className="relative mb-12">
              <motion.p 
                variants={fadeInUp}
                transition={{ duration: 0.8 }}
                className="text-2xl sm:text-3xl md:text-4xl text-gray-300 font-light text-center px-4 leading-relaxed"
              >
                Revolutionize Your Recruitment Process with 
                <motion.span 
                  className="text-[#BE185D] font-semibold inline-block mx-2"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                    ease: "easeInOut"
                  }}
                > AI-Driven</motion.span> 
                Evaluation
              </motion.p>
              
              {/* Animated CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-12 flex justify-center"
              >
                <Link href="https://forms.gle/Ks3Pj8RUPVpGGfBR7" className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-300 ease-in-out rounded-full bg-gradient-to-r from-[#BE185D] via-pink-600 to-[#BE185D] bg-size-200 bg-pos-0 hover:bg-pos-100">
                  <span className="mr-2">Start Free Trial</span>
                  <svg 
                    className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="absolute -inset-1 rounded-full blur-md bg-gradient-to-r from-[#BE185D]/40 to-pink-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section with Animated Numbers */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#BE185D]/5 to-black/50"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                { number: "90%", label: "Time Saved in Recruitment" },
                { number: "2x", label: "Faster Candidate Processing" },
                { number: "100%", label: "Objective Evaluation" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative group"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#BE185D]/20 to-pink-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative bg-black/40 backdrop-blur-xl border border-[#BE185D]/10 p-8 rounded-xl text-center hover:border-[#BE185D]/30 transition-all duration-500"
                  >
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                      className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-pink-400 mb-4"
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-xl text-gray-300">{stat.label}</div>
                    {/* Decorative Elements */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#BE185D]/5 rounded-full blur-2xl group-hover:bg-[#BE185D]/10 transition-all duration-500"></div>
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#BE185D]/5 rounded-full blur-2xl group-hover:bg-[#BE185D]/10 transition-all duration-500"></div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Animated Background Lines */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-px w-full bg-gradient-to-r from-transparent via-[#BE185D]/20 to-transparent"
                style={{ top: `${25 + i * 25}%` }}
                animate={{
                  x: ['-100%', '100%'],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        </section>

        {/* Enhanced Value Proposition Section with 3D Cards */}
        <Beam className="py-16 sm:py-32 px-4">
          <div className="max-w-6xl mx-auto antialiased">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16 sm:mb-24"
            >
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block px-4 py-1.5 rounded-full bg-[#BE185D]/10 border border-[#BE185D]/20 text-[#BE185D] text-sm font-medium mb-4"
              >
                Why Choose Us
              </motion.span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 relative">
                The <span className="text-[#BE185D]">Mockello</span> Advantage
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#BE185D] to-transparent"></div>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Experience the future of recruitment with our cutting-edge AI technology
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Time Efficiency",
                  subtitle: "90% Time Savings",
                  description: "Deploy just one HR representative instead of ten with our AI-driven platform.",
                  icon: (
                    <svg className="w-6 h-6 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
                {
                  title: "Cost Efficiency",
                  subtitle: "Minimize Expenses",
                  description: "Perfect for bulk hiring and campus recruitment drives with optimized resource allocation.",
                  icon: (
                    <svg className="w-6 h-6 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
                {
                  title: "AI Evaluation",
                  subtitle: "Objective Assessment",
                  description: "Ensure unbiased, consistent candidate evaluations with advanced AI algorithms.",
                  icon: (
                    <svg className="w-6 h-6 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ 
                    y: -10,
                    transition: { duration: 0.2 }
                  }}
                  className="group relative"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#BE185D]/20 to-pink-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative bg-black/40 backdrop-blur-xl border border-[#BE185D]/10 p-8 rounded-xl hover:border-[#BE185D]/30 transition-all duration-500">
                    <div className="w-12 h-12 bg-[#BE185D]/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                    <div className="text-[#BE185D] font-semibold mb-4">{feature.subtitle}</div>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Beam>

        {/* Company Dashboard Section with Interactive Features */}
        <section className="relative py-32 px-4 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-[#BE185D]/5 to-black"></div>
            {/* Animated floating elements */}
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-64 h-64 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(190,24,93,0.1) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    top: `${20 + i * 30}%`,
                    left: `${10 + i * 30}%`
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i
                  }}
                />
              ))}
            </div>
          </div>

          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block px-4 py-1.5 rounded-full bg-[#BE185D]/10 border border-[#BE185D]/20 text-[#BE185D] text-sm font-medium mb-4"
              >
                Personalized Company Dashboard
              </motion.span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                Your <span className="text-[#BE185D]">Intelligent</span> Recruitment Hub
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                One dashboard to manage your entire recruitment process with AI-powered insights
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Feature Cards */}
              <div className="space-y-8">
                {/* HR Management Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#BE185D]/20 to-pink-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative bg-black/40 backdrop-blur-xl border border-[#BE185D]/10 p-8 rounded-xl hover:border-[#BE185D]/30 transition-all duration-500">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#BE185D]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">HR Management</h3>
                        <p className="text-gray-400 mb-4">Create and manage HR profiles with secure access credentials. Assign specific roles and permissions to each HR representative.</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-[#BE185D]/10 rounded-full text-sm text-[#BE185D]">User Management</span>
                          <span className="px-3 py-1 bg-[#BE185D]/10 rounded-full text-sm text-[#BE185D]">Role Assignment</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Job Posting Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#BE185D]/20 to-pink-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative bg-black/40 backdrop-blur-xl border border-[#BE185D]/10 p-8 rounded-xl hover:border-[#BE185D]/30 transition-all duration-500">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#BE185D]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Job Posting</h3>
                        <p className="text-gray-400 mb-4">Create and manage job postings with intelligent templates. Track applications and candidate pipeline in real-time.</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-[#BE185D]/10 rounded-full text-sm text-[#BE185D]">Smart Templates</span>
                          <span className="px-3 py-1 bg-[#BE185D]/10 rounded-full text-sm text-[#BE185D]">Application Tracking</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Feature Cards */}
              <div className="space-y-8">
                {/* One-Click ATS Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#BE185D]/20 to-pink-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative bg-black/40 backdrop-blur-xl border border-[#BE185D]/10 p-8 rounded-xl hover:border-[#BE185D]/30 transition-all duration-500">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#BE185D]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">One-Click ATS</h3>
                        <p className="text-gray-400 mb-4">Automated resume screening and candidate evaluation with AI-powered insights. Filter and rank candidates instantly.</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-[#BE185D]/10 rounded-full text-sm text-[#BE185D]">AI Screening</span>
                          <span className="px-3 py-1 bg-[#BE185D]/10 rounded-full text-sm text-[#BE185D]">Smart Filtering</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* HR Assignment Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#BE185D]/20 to-pink-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative bg-black/40 backdrop-blur-xl border border-[#BE185D]/10 p-8 rounded-xl hover:border-[#BE185D]/30 transition-all duration-500">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#BE185D]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">HR Assignment</h3>
                        <p className="text-gray-400 mb-4">Efficiently assign filtered candidates to specific HR representatives. Monitor interview progress and feedback in real-time.</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-[#BE185D]/10 rounded-full text-sm text-[#BE185D]">Smart Distribution</span>
                          <span className="px-3 py-1 bg-[#BE185D]/10 rounded-full text-sm text-[#BE185D]">Progress Tracking</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Interactive Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-20 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#BE185D]/20 to-pink-600/20 rounded-xl blur-xl"></div>
              <div className="relative bg-black/40 backdrop-blur-xl border border-[#BE185D]/10 p-8 rounded-xl">
                <h3 className="text-2xl font-bold mb-8 text-center">Interactive Dashboard Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Active Jobs", value: "12", trend: "+3" },
                    { label: "Total Candidates", value: "234", trend: "+28" },
                    { label: "Interviews Scheduled", value: "45", trend: "+12" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-black/20 p-6 rounded-lg"
                    >
                      <div className="text-gray-400 mb-2">{stat.label}</div>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="text-[#BE185D] text-sm">{stat.trend} this week</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* HR Dashboard Section */}
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-[#BE185D]/5 to-black"></div>
            {/* Animated floating elements */}
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-64 h-64 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(190,24,93,0.1) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    top: `${20 + i * 30}%`,
                    right: `${10 + i * 30}%`
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i
                  }}
                />
              ))}
            </div>
          </div>

          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block px-4 py-1.5 rounded-full bg-[#BE185D]/10 border border-[#BE185D]/20 text-[#BE185D] text-sm font-medium mb-4"
              >
                HR Portal
              </motion.span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                Streamlined <span className="text-[#BE185D]">HR Experience</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Personalized dashboard for HRs with powerful tools for efficient candidate management
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Process Flow */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-[#BE185D]/20 to-pink-600/20 rounded-xl blur-xl"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-[#BE185D]/10 p-8 rounded-xl">
                  <h3 className="text-2xl font-bold mb-6">Recruitment Process Flow</h3>
                  <div className="space-y-6">
                    {[
                      {
                        step: "1",
                        title: "Send Invitations",
                        description: "Use customizable email templates with your native mail client for seamless candidate communication",
                        icon: (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        )
                      },
                      {
                        step: "2",
                        title: "Define Requirements",
                        description: "Specify technical skills and soft skills for AI-driven intelligent candidate assessment",
                        icon: (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        )
                      },
                      {
                        step: "3",
                        title: "Track Progress",
                        description: "Monitor interview status and candidate performance in real-time",
                        icon: (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        )
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-4 relative">
                        <div className="w-12 h-12 bg-[#BE185D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {item.icon}
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 rounded-full bg-[#BE185D] text-white text-sm flex items-center justify-center">
                              {item.step}
                            </span>
                            <h4 className="text-lg font-semibold">{item.title}</h4>
                          </div>
                          <p className="text-gray-400">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Results & Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-[#BE185D]/20 to-pink-600/20 rounded-xl blur-xl"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-[#BE185D]/10 p-8 rounded-xl">
                  <h3 className="text-2xl font-bold mb-6">Results & Decision Making</h3>
                  
                  {/* Automated Ranking System */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-4">Automated Ranking System</h4>
                    <div className="space-y-4">
                      {[
                        { candidate: "Candidate A", score: 95 },
                        { candidate: "Candidate B", score: 88 },
                        { candidate: "Candidate C", score: 82 }
                      ].map((item, index) => (
                        <div key={index} className="relative">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-400">{item.candidate}</span>
                            <span className="text-sm text-[#BE185D]">{item.score}%</span>
                          </div>
                          <div className="h-2 bg-[#BE185D]/10 rounded-full">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${item.score}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                              className="h-full bg-[#BE185D] rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <button className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#BE185D] to-pink-600 text-white font-semibold hover:from-pink-600 hover:to-[#BE185D] transition-all duration-300">
                      Send Selection Emails to Top Candidates
                    </button>
                    <button className="w-full px-6 py-3 rounded-lg border border-[#BE185D] text-[#BE185D] font-semibold hover:bg-[#BE185D]/10 transition-all duration-300">
                      View Detailed Assessment Reports
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Student Rankings Section */}
        <section className="relative py-32 px-4">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-[#BE185D]/5 to-black"></div>
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Smart <span className="text-[#BE185D]">Candidate Rankings</span>
              </h2>
              <p className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto">
                Comprehensive evaluation using multi-dimensional AI assessment criteria
              </p>
              <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-transparent via-[#BE185D] to-transparent mx-auto mt-6"></div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Evaluation Criteria */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="bg-black/40 backdrop-blur-sm border border-[#BE185D]/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-semibold mb-6">Comprehensive Evaluation Criteria</h3>
                  <div className="space-y-6">
                    {/* Technical Assessment */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#BE185D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Technical Depth Analysis</h4>
                        <p className="text-gray-400">In-depth evaluation of technical knowledge, problem-solving abilities, and coding proficiency with real-time assessment.</p>
                      </div>
                    </div>

                    {/* Communication Skills */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#BE185D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Communication Assessment</h4>
                        <p className="text-gray-400">Evaluation of verbal skills, clarity of expression, and professional communication abilities during the interview process.</p>
                      </div>
                    </div>

                    {/* Behavioral Analysis */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#BE185D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Body Language & Behavioral Analysis</h4>
                        <p className="text-gray-400">AI-powered assessment of non-verbal cues, confidence levels, and professional demeanor throughout the interview.</p>
                      </div>
                    </div>

                    {/* Psychological Assessment */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#BE185D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Situational & Psychological Assessment</h4>
                        <p className="text-gray-400">Strategic evaluation of decision-making abilities, emotional intelligence, and responses to situational challenges.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Proctoring & Security */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="bg-black/40 backdrop-blur-sm border border-[#BE185D]/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-semibold mb-6">Advanced Proctoring & Security</h3>
                  <div className="space-y-6">
                    {/* Professional Standards */}
                    <div className="p-4 bg-black/20 rounded-xl">
                      <h4 className="text-lg font-semibold mb-2">Professional Standards Verification</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li className="flex items-center gap-2">
                          <span className="text-[#BE185D]">✓</span>
                          Automated dress code compliance checks
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-[#BE185D]">✓</span>
                          Professional environment assessment
                        </li>
                      </ul>
                    </div>

                    {/* Active Monitoring */}
                    <div className="p-4 bg-black/20 rounded-xl">
                      <h4 className="text-lg font-semibold mb-2">Real-time Proctoring</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li className="flex items-center gap-2">
                          <span className="text-[#BE185D]">✓</span>
                          Continuous active proctoring
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-[#BE185D]">✓</span>
                          Full-screen mode enforcement
                        </li>
                      </ul>
                    </div>

                    {/* Security Measures */}
                    <div className="p-4 bg-black/20 rounded-xl">
                      <h4 className="text-lg font-semibold mb-2">Anti-Cheating System</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li className="flex items-center gap-2">
                          <span className="text-[#BE185D]">✓</span>
                          Advanced anti-cheating detection
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-[#BE185D]">✓</span>
                          Multiple device usage monitoring
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-[#BE185D]">✓</span>
                          Browser activity tracking
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Company Interface Section */}
        <section className="relative py-32 px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-[#BE185D]/5 to-black"></div>
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                How It <span className="text-[#BE185D]">Works</span>
              </h2>
              <p className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto">
                A seamless end-to-end recruitment process for companies, HRs, and candidates
              </p>
              <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-transparent via-[#BE185D] to-transparent mx-auto mt-6"></div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Company Flow */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="bg-black/40 backdrop-blur-sm border border-[#BE185D]/10 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-[#BE185D]/10 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold mb-6">Company Journey</h3>
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">1</span>
                      <span className="text-gray-300">Complete company registration process</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">2</span>
                      <span className="text-gray-300">Access company dashboard</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">3</span>
                      <span className="text-gray-300">Create HR profiles with credentials</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">4</span>
                      <span className="text-gray-300">Configure one-click ATS integration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">5</span>
                      <span className="text-gray-300">Assign candidates to HR representatives</span>
                    </li>
                  </ol>
                </div>
              </motion.div>

              {/* HR Flow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="bg-black/40 backdrop-blur-sm border border-[#BE185D]/10 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-[#BE185D]/10 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold mb-6">HR Process</h3>
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">1</span>
                      <span className="text-gray-300">Login to HR portal</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">2</span>
                      <span className="text-gray-300">View assigned candidates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">3</span>
                      <span className="text-gray-300">Define tech & soft skills requirements</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">4</span>
                      <span className="text-gray-300">Send batch invitations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">5</span>
                      <span className="text-gray-300">Review rankings and results</span>
                    </li>
                  </ol>
                </div>
              </motion.div>

              {/* Candidate Flow */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="bg-black/40 backdrop-blur-sm border border-[#BE185D]/10 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-[#BE185D]/10 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold mb-6">Candidate Steps</h3>
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">1</span>
                      <span className="text-gray-300">Create Mockello ID using resume parser</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">2</span>
                      <span className="text-gray-300">Click invitation link from HR</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">3</span>
                      <span className="text-gray-300">Enter Mockello ID & get session ID</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">4</span>
                      <span className="text-gray-300">Start evaluation in full-screen mode</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BE185D]/20 flex items-center justify-center text-sm">5</span>
                      <span className="text-gray-300">Complete assessment & receive confirmation</span>
                    </li>
                  </ol>
                </div>
              </motion.div>
            </div>

            {/* Process Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-20 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#BE185D]/20 to-pink-600/20 rounded-xl blur-xl"></div>
              <div className="relative bg-black/40 backdrop-blur-xl border border-[#BE185D]/10 p-8 rounded-xl">
                <h3 className="text-2xl font-bold mb-8 text-center">Complete Process Timeline</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {[
                    "Company Registration",
                    "HR Setup",
                    "Candidate Assignment",
                    "Invitation Process",
                    "Candidate Evaluation",
                    "Results & Rankings"
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-black/20 px-6 py-3 rounded-lg"
                    >
                      <div className="text-[#BE185D] font-semibold mb-1">Step {index + 1}</div>
                      <div className="text-gray-300">{step}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Resume Parser Section */}
        <section className="relative py-32 px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-[#BE185D]/5 to-black"></div>
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Free <span className="text-[#BE185D]">Resume Parser</span>
              </h2>
              <p className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto">
                Get professional resume analysis and your unique Mockello ID
              </p>
              <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-transparent via-[#BE185D] to-transparent mx-auto mt-6"></div>
            </motion.div>

            <div className="grid grid-cols-1 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8 max-w-2xl mx-auto"
              >
                <div className="bg-black/40 backdrop-blur-sm border border-[#BE185D]/10 rounded-2xl p-6">
                  <h3 className="text-2xl font-semibold mb-6">Smart Analysis Features</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#BE185D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Skill Extraction</h4>
                        <p className="text-gray-400">Automatically identify and categorize your skills</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#BE185D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Experience Analysis</h4>
                        <p className="text-gray-400">Detailed breakdown of your work history</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#BE185D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Improvement Suggestions</h4>
                        <p className="text-gray-400">Get personalized recommendations to enhance your resume</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Ready to Transform Section with Modern Design */}
        <section className="relative py-32 px-4 overflow-hidden">
          {/* Modern Background Effects */}
          <div className="absolute inset-0">
            {/* Gradient Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(190,24,93,0.1)_0%,transparent_50%)] animate-pulse"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(190,24,93,0.15)_0%,transparent_30%)]"></div>
            
            {/* Glass Effect Cards */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute w-64 h-64 rounded-full"
                style={{
                  background: 'radial-gradient(circle at center, rgba(190,24,93,0.1) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                  top: '20%',
                  left: '10%'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute w-64 h-64 rounded-full"
                style={{
                  background: 'radial-gradient(circle at center, rgba(190,24,93,0.1) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                  bottom: '20%',
                  right: '10%'
                }}
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 8,
                  delay: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.h2 
                className="text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-[#BE185D] to-white"
                animate={{
                  backgroundPosition: ['200% 0', '-200% 0']
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Ready to Transform Your Recruitment?
              </motion.h2>
              <p className="text-xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm">
                Join forward-thinking companies using Mockello to streamline their recruitment process, reduce costs, and identify top talent efficiently.
              </p>
              <Link href="https://forms.gle/Ks3Pj8RUPVpGGfBR7" className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold tracking-wide text-white transition-all duration-500 ease-in-out transform bg-gradient-to-r from-[#BE185D] to-[#BE185D]/80 rounded-full hover:scale-105 hover:shadow-[0_0_30px_-5px_#BE185D] overflow-hidden">
                <span className="absolute w-0 h-0 transition-all duration-500 ease-in-out bg-white rounded-full group-hover:w-80 group-hover:h-80 opacity-10"></span>
                <span className="relative">Get Started Now</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Footer with Animated Border and Gradient */}
        <footer className="relative bg-black py-12 px-4 overflow-hidden">
          {/* Animated Border */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#BE185D] to-transparent"
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#BE185D] to-white">Mockello</h3>
                <p className="text-gray-400">Transforming recruitment through AI innovation</p>
              </motion.div>
              
              {/* Staggered Animation for Footer Links */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h4 className="text-lg font-semibold text-white">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/features" className="hover:text-[#BE185D] transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-[#BE185D] transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/landing" className="hover:text-[#BE185D] transition-colors">
                      Demo
                    </Link>
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h4 className="text-lg font-semibold text-white">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/about" className="hover:text-[#BE185D] transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/about#team" className="hover:text-[#BE185D] transition-colors">
                      Team
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="hover:text-[#BE185D] transition-colors">
                      Careers
                    </Link>
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h4 className="text-lg font-semibold text-white">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/blog" className="hover:text-[#BE185D] transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-[#BE185D] transition-colors">
                      Support
                    </Link>
                  </li>
                </ul>
              </motion.div>
            </div>
            
            {/* Animated Copyright Section */}
            <motion.div 
              className="mt-12 pt-8 border-t border-[#BE185D]/20 text-center text-gray-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <p>© 2025 Mockello. All rights reserved.</p>
            </motion.div>
          </div>
        </footer>
      </main>
    </>
  );
}