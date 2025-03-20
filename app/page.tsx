
"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const Homepage = () => {
  const router = useRouter();

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 8px 20px rgba(79, 70, 229, 0.2)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.97 }
  };

  const handleNavigation = (path:any) => {
    router.push(path);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background decorative elements */}
      <motion.div 
        className="absolute top-20 left-20 w-24 h-24 rounded-full bg-blue-200 opacity-30 blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.5, duration: 1.5 }}
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-purple-200 opacity-30 blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.7, duration: 1.5 }}
      />

      <motion.div
        className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 backdrop-blur-sm bg-white/90 border border-white/50"
        variants={itemVariants}
      >
        <motion.div
          className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
          variants={itemVariants}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 mb-6"
          variants={itemVariants}
        >
          College Tools
        </motion.h1>

        <motion.p
          className="text-lg text-gray-600 text-center mb-10 max-w-xl mx-auto"
          variants={itemVariants}
        >
          Unlock the power of your study materials. Upload PDFs or take a quick assessment to experience our intelligent document analysis.
        </motion.p>

        <motion.div
          className="flex flex-col md:flex-row gap-6 justify-center"
          variants={itemVariants}
        >
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl w-full md:w-auto flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => handleNavigation('/pdfupload')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload PDF
          </motion.button>

          <motion.button
            className="px-8 py-4 bg-white border-2 border-indigo-500 text-indigo-700 font-semibold rounded-xl w-full md:w-auto flex items-center justify-center gap-2 shadow-lg shadow-indigo-50"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => handleNavigation('/quiz')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Take a Test
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-12 text-sm text-indigo-600 font-medium flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Powered by Advanced Document Analysis
      </motion.div>
    </motion.div>
  );
};

export default Homepage;