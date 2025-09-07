import { useState, useEffect } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import axios from "axios";
import { motion } from "framer-motion";

// ---------- Futuristic Landing Page ----------
function FuturisticLanding({ onStart }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Glowing orbs */}
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
        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-2xl transition"
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  );
}

// ---------- Main AI Code Mentor Editor ----------
function MainEditor() {
  const [code, setCode] = useState(`def sum(a, b):\n  return a + b`);
  const [review, setReview] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, [code]);

  async function reviewCode() {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/ai/get-review/", { code });
      setReview(response.data);
      await logUserActivity("Review Code", "User clicked Review Code");
    } catch (err) {
      console.error("Review or activity logging failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function logUserActivity(activityType, details) {
    try {
      await axios.post("http://localhost:3000/api/activity", {
        activityType,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Activity log failed:", error);
    }
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setCode(e.target.result);

      const ext = file.name.split(".").pop();
      const langMap = {
        js: "javascript",
        py: "python",
        cpp: "cpp",
        cs: "csharp",
        ts: "typescript",
        html: "html",
        json: "json",
        java: "java",
        css: "css",
      };
      setLanguage(langMap[ext] || "javascript");

      reader.readAsText(file);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      {/* Header */}
      <motion.header
        className="w-full text-center py-6 text-4xl font-extrabold tracking-wide 
        bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 
        text-transparent bg-clip-text"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        AI Code Mentor 🤖
      </motion.header>

      {/* Main Content */}
      <div className="flex flex-row gap-6 w-full max-w-7xl mx-auto mt-8">
        {/* Code Editor */}
        <motion.div
          className="w-1/2 bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/20 flex flex-col"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <label className="mb-3 text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Upload File
          </label>
          <input
            type="file"
            accept=".js, .py, .css, .cpp, .cs, .ts, .html, .json, .java"
            onChange={handleFileUpload}
            className="mb-4 text-sm text-gray-300 cursor-pointer 
              bg-gray-800/70 border border-gray-700 
              px-3 py-2 rounded-lg hover:bg-gray-700 transition"
          />

          <div className="border border-gray-600 rounded-lg p-4 bg-black/40 shadow-inner flex-grow overflow-auto">
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={(code) =>
                prism.highlight(code, prism.languages[language] || prism.languages.javascript, language)
              }
              padding={12}
              style={{ fontFamily: "Fira Code, monospace", fontSize: 15 }}
            />
          </div>

          <motion.button
            onClick={reviewCode}
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px #9333ea" }}
            whileTap={{ scale: 0.95 }}
            className="mt-5 py-3 text-lg font-semibold rounded-xl 
              bg-gradient-to-r from-blue-500 to-purple-600 
              hover:from-purple-500 hover:to-blue-600 
              transition shadow-lg"
            disabled={loading}
          >
            {loading ? "Reviewing..." : "🚀 Code Audit"}
          </motion.button>
        </motion.div>

        {/* Review Panel */}
        <motion.div
          className="w-1/2 bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/20 overflow-auto"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-xl font-bold mb-4 text-purple-400">Intelligent Code Guidance 🚀</h2>
          <Markdown rehypePlugins={[rehypeHighlight]} className="text-gray-200 leading-relaxed">
            {review || "Smart code insights generated by AI will appear here..."}
          </Markdown>
        </motion.div>
      </div>
    </div>
  );
}

// ---------- App Component ----------
export default function App() {
  const [showLanding, setShowLanding] = useState(true);

  const handleStart = () => setShowLanding(false);

  return (
    <div className="min-h-screen transition-all duration-700">
      {showLanding ? <FuturisticLanding onStart={handleStart} /> : <MainEditor />}
    </div>
  );
}
