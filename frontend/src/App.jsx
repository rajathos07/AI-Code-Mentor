// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-java";
import Markdown from "react-markdown";
import axios from "axios";

/* Panels */
import Sidebar from "./components/patterns/Sidebar";
import QuizPanel from "./components/quiz/QuizPanel";
import FuturisticLanding from "./components/FuturisticLanding";

/* Auth */
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import LearningPanel from "./components/learning/LearningPanel";

/* ---------- Global styles (dark, futuristic) ---------- */
function GlobalStyles() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap');

html { scroll-behavior:smooth; }
body {
  background: radial-gradient(1200px 800px at 10% -10%, rgba(96,165,250,.08), transparent),
              radial-gradient(1200px 800px at 110% 10%, rgba(167,139,250,.08), transparent),
              #0a0a0f;
  color: #e7e7ef;
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
}
.hero-heading { font-family: 'Sora', ui-sans-serif, system-ui; letter-spacing: -0.02em; }
.code-font { font-family: 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }

/* Modern scrollbars */
* { scrollbar-width: thin; scrollbar-color: rgba(167,139,250,.7) rgba(17,24,39,.35); }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: linear-gradient(180deg, rgba(17,24,39,.35), rgba(2,6,23,.35)); border-radius: 12px; }
::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #60a5fa, #a78bfa); border-radius: 12px; border: 2px solid rgba(2,6,23,.55); }
::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #a78bfa, #ec4899); }
    `}</style>
  );
}

/* ---------- Axios base ---------- */
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  (typeof process !== "undefined" && process.env?.VITE_API_BASE) ||
  "http://localhost:3000";
axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true;

/* ---------- Helpers ---------- */
const LOGIN_FIRST_ALWAYS = false;
function debounce(fn, wait = 300) { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait);} }
function getInitials(name = "") { const parts = String(name).trim().split(/\s+/); return parts.slice(0,2).map(p=>p[0]?.toUpperCase()).join("") || "U"; }

function uid() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

/* ---------- Error Boundary ---------- */
class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state={hasError:false}; }
  static getDerivedStateFromError(){ return {hasError:true}; }
  componentDidCatch(err,info){ console.error("Error caught by boundary:", err, info); }
  render(){ return this.state.hasError ? (
    <div className="p-4 bg-red-900/20 border border-red-500/40 rounded-xl text-red-200">
      <div className="font-bold">Something went wrong with the code editor</div>
      <div className="text-sm">Please refresh the page or try again.</div>
    </div>
  ): this.props.children; }
}

/* ---------- Main Editor (Top/Bottom layout; no extra buttons in review) ---------- */
function MainEditor({ user, onLogout }) {
  const [code, setCode] = useState(`def sum(a, b):\n    return a + b\n\nprint(sum(2, 3))`);
  const [review, setReview] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { prism.highlightAll(); }, [code, review]);

  const submittingRef = React.useRef(false);

  const logUserActivity = useCallback(async (action, details = {}, opts = {}) => {
    try {
      const requestId = opts.requestId || uid();
      const targetId = opts.targetId || details?.metadata?.targetId || undefined;

      const payload = {
        action,
        details: {
          ...details,
          metadata: {
            ...(details?.metadata || {}),
            targetId,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        },
        requestId
      };

      await axios.post("/api/activity/log", payload);
      return { ok: true, requestId };
    } catch (err) {
      console.error("logUserActivity failed", err);
      return { ok: false };
    }
  }, []);

  const debouncedLogCodeChange = useCallback(
    debounce((newCode) => { logUserActivity("code_modified", { codeLength: newCode.length, language }); }, 800),
    [language, logUserActivity]
  );

  function handleFileUpload(event) {
    const file = event.target.files[0]; if (!file) return;
    if (file.size > 1024 * 1024) { alert("File too large. Please select a file under 1MB."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result; setCode(content);
      const ext = file.name.split(".").pop().toLowerCase();
      const map = { js:"javascript", jsx:"javascript", ts:"javascript", tsx:"javascript", py:"python", css:"css", json:"json", html:"html", java:"java", cpp:"cpp", c:"c" };
      if (map[ext]) setLanguage(map[ext]);
      logUserActivity("file_uploaded", { fileName: file.name, fileSize: file.size, detectedLanguage: map[ext] || language });
    };
    reader.onerror = () => alert("Error reading file. Please try again.");
    reader.readAsText(file);
  }

  const handleCodeChange = (newCode) => { setCode(newCode); debouncedLogCodeChange(newCode); };

  async function reviewCode() {
    if (submittingRef.current) return;
    submittingRef.current = true;

    if (!code.trim()) {
      submittingRef.current = false;
      return;
    }

    const targetId = uid();

    try {
      setLoading(true);

      const { requestId: reqIdRequested } = await logUserActivity(
        "code_review_requested",
        { language, codeLength: code.length, hasUser: !!user },
        { targetId }
      );

      const response = await axios.post("/ai/get-review/", { code, language });

      let aiResponse =
        response.data.response?.review ||
        response.data.response ||
        response.data.data?.review ||
        response.data.data ||
        response.data.review ||
        response.data;

      if (typeof aiResponse === "object" && aiResponse !== null) {
        aiResponse = aiResponse.content || aiResponse.message || aiResponse.text || JSON.stringify(aiResponse, null, 2);
      }
      if (typeof aiResponse !== "string") aiResponse = String(aiResponse);
      aiResponse = aiResponse.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/^\"|\"$/g, "").replace(/\\t/g, "    ").trim();

      setReview(aiResponse || "");

      await logUserActivity(
        "code_review_completed",
        { success: true, fileNames: [], reviewSummary: aiResponse, codeLength: code.length },
        { targetId }
      );
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Unknown error";
      setReview(`❌ Error: ${msg}`);
      await logUserActivity("code_review_failed", { error: msg, statusCode: err.response?.status }, {});
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  }

  const avatarSrc = user?.avatar || user?.avatarUrl || user?.photoURL;
  const displayName = user?.name || user?.fullName || user?.username || "User";

  return (
    <div className="min-h-screen px-5 py-6">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(key) => {
          setSidebarOpen(false);
          if (key === "mentor") {/* already here */}
          if (key === "quiz") window.dispatchEvent(new CustomEvent("route", { detail: "quiz" }));
          if (key === "learning") window.dispatchEvent(new CustomEvent("route", { detail: "learning" }));
        }}
        user={user}
        onLogout={onLogout}
      />
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />}

      <motion.header
        className="relative w-full py-5 flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-500/30 hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-200 backdrop-blur-sm shadow-lg"
          >☰</button>
          <div className="hero-heading text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Agentic Coding ⚡
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 backdrop-blur-sm">
          {avatarSrc ? (
            <img src={avatarSrc} alt={displayName} className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/30" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg">
              {getInitials(displayName)}
            </div>
          )}
          <span className="text-sm font-medium text-gray-200">{displayName}</span>
        </div>
      </motion.header>

      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900/80 via-gray-900/90 to-gray-950/95 backdrop-blur-xl shadow-2xl">
          <div className="p-5 border-b border-purple-500/20">
            <div className="flex flex-wrap gap-4 items-center">
              <label className="text-xs font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase">
                Upload File
              </label>
              <input
                type="file" onChange={handleFileUpload}
                accept=".js,.jsx,.ts,.tsx,.py,.css,.json,.html,.java,.cpp,.c,.txt"
                className="text-sm text-gray-300 cursor-pointer bg-gray-800/80 border border-purple-500/30 px-4 py-2 rounded-xl hover:bg-gray-800 hover:border-purple-500/50 transition"
              />
              <div className="ml-auto flex items-center gap-3">
                <label className="text-xs font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-800/80 border border-purple-500/30 px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                  <option value="html">HTML</option>
                  <option value="java">Java</option>
                </select>

                <button
                  onClick={reviewCode}
                  disabled={loading || !code.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 transition shadow-lg disabled:opacity-60 text-sm font-semibold"
                >
                  {loading ? "Analyzing..." : "Get AI Review"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="rounded-xl border border-purple-500/20 overflow-hidden bg-black/30">
              <Editor
                value={code}
                onValueChange={handleCodeChange}
                highlight={(input) => prism.highlight(input, prism.languages[language] || prism.languages.python, language)}
                padding={16}
                className="code-font min-h-[360px] text-sm leading-6"
                style={{ outline: "none" }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900/80 via-gray-900/90 to-gray-950/95 backdrop-blur-xl shadow-2xl">
          <div className="p-8">
            {review ? (
              <div className="prose prose-invert prose-lg max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-3xl prose-h1:mb-6 prose-h1:bg-gradient-to-r prose-h1:from-blue-400 prose-h1:to-purple-400 prose-h1:text-transparent prose-h1:bg-clip-text
                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-blue-300 prose-h2:border-b prose-h2:border-purple-500/30 prose-h2:pb-2
                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-purple-300
                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-blue-300 prose-strong:font-semibold
                prose-code:text-pink-400 prose-code:bg-gray-800/60 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-gray-950/80 prose-pre:border prose-pre:border-purple-500/30 prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto
                prose-ul:list-disc prose-ul:ml-6 prose-ul:space-y-2 prose-ul:text-gray-300
                prose-ol:list-decimal prose-ol:ml-6 prose-ol:space-y-2 prose-ol:text-gray-300
                prose-li:text-gray-300 prose-li:leading-relaxed
                prose-a:text-blue-400 prose-a:underline prose-a:decoration-blue-400/30 hover:prose-a:decoration-blue-400
                prose-blockquote:border-l-4 prose-blockquote:border-purple-500/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
              ">
                <Markdown>{review}</Markdown>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">✨</div>
                <div className="text-lg text-gray-400">Run <span className="text-purple-400 font-semibold">Get AI Review</span> to receive professional code feedback</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- App Router ---------- */
export default function App() {
  const [route, setRoute] = useState("landing");
  const [user, setUser] = useState(null);
  const [pendingRoute, setPendingRoute] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await axios.get("/api/auth/session");
        if (response.data.success && response.data.user) {
          // User has active session on backend
          setUser(response.data.user);
          
          // Check if user has logged in during this browser session
          const hasLoggedInThisSession = sessionStorage.getItem("userLoggedIn");
          
          if (hasLoggedInThisSession === "true") {
            // User logged in and then refreshed - go to editor
            setRoute("editor");
          } else {
            // First visit (even with valid backend session) - show landing
            setRoute("landing");
          }
        } else {
          // No active session - show landing page
          setRoute("landing");
        }
      } catch (err) {
        console.log("No active session");
        setRoute("landing");
      } finally {
        setSessionChecked(true);
      }
    }
    checkSession();
  }, []);

  // Handle route changes from custom events
  useEffect(() => {
    function onRoute(e) { 
      setRoute(e.detail);
    }
    window.addEventListener("route", onRoute);
    return () => window.removeEventListener("route", onRoute);
  }, []);

  useEffect(() => { 
    if (LOGIN_FIRST_ALWAYS && sessionChecked) setRoute("login"); 
  }, [sessionChecked]);

  const onLogout = useCallback(async () => { 
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    // Clear the login flag on logout
    sessionStorage.removeItem("userLoggedIn");
    setUser(null); 
    setRoute("landing"); 
  }, []);

  // Show loading while checking session
  if (!sessionChecked) {
    return (
      <>
        <GlobalStyles />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <div className="text-lg text-gray-400">Loading...</div>
          </div>
        </div>
      </>
    );
  }

  if (!user && (route === "login" || route === "signup" || LOGIN_FIRST_ALWAYS)) {
    if (route === "signup") {
      return (
        <>
          <GlobalStyles />
          <SignupPage
            onSignupSuccess={(maybeUser) => {
              if (maybeUser && maybeUser.id) {
                setUser(maybeUser);
                // Mark that user has logged in this session
                sessionStorage.setItem("userLoggedIn", "true");
                setRoute(pendingRoute || "editor");
                setPendingRoute(null);
              } else {
                setRoute("login");
              }
            }}
            switchToLogin={() => setRoute("login")}
          />
        </>
      );
    }

    return (
      <>
        <GlobalStyles />
        <LoginPage
          onLogin={(u) => {
            setUser(u || { username: "User" });
            // Mark that user has logged in this session
            sessionStorage.setItem("userLoggedIn", "true");
            setRoute(pendingRoute || "editor");
            setPendingRoute(null);
          }}
          switchToSignup={() => setRoute("signup")}
        />
      </>
    );
  }

  if (route === "landing") {
    return (
      <>
        <GlobalStyles />
        <FuturisticLanding
          onSignup={() => setRoute("signup")}
          onSelect={(target) => { 
            if (user) {
              // User already logged in from previous session, set flag and navigate
              sessionStorage.setItem("userLoggedIn", "true");
              setRoute(target);
            } else {
              setPendingRoute(target); 
              setRoute("login"); 
            }
          }}
        />
      </>
    );
  }

  if (route === "quiz") {
    return (
      <>
        <GlobalStyles />
        <QuizPanel
          user={user || { username: "User" }}
          onLogout={onLogout}
          onSelectNav={(key) => {
            if (key === "editor" || key === "mentor") return setRoute("editor");
            if (key === "quiz") return setRoute("quiz");
            if (key === "learning") return setRoute("learning");
          }}
        />
      </>
    );
  }

  if (route === "learning") {
    return (
      <>
        <GlobalStyles />
        <LearningPanel
          user={user || { username: "User" }}
          onLogout={onLogout}
          onSelectNav={(key) => {
            if (key === "editor" || key === "mentor") return setRoute("editor");
            if (key === "quiz") return setRoute("quiz");
            if (key === "learning") return setRoute("learning");
          }}
        />
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <ErrorBoundary>
        <MainEditor
          user={user || { username: "User" }}
          onLogout={onLogout}
        />
      </ErrorBoundary>
    </>
  );
}