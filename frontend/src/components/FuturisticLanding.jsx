import { motion } from "framer-motion";

export default function FuturisticLanding() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Glowing background orbs */}
      <div className="absolute top-10 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      {/* Main content */}
      <motion.div
        className="relative z-10 text-center p-10 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-xl max-w-3xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Welcome to AI Code Mentor 🚀
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Your futuristic AI-powered assistant for smarter coding.  
          Paste, upload, and review your code with cutting-edge feedback.
        </p>
        <motion.a
          href="#code-reviewer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-2xl transition"
        >
          Get Started
        </motion.a>
      </motion.div>
    </div>
  );
}
