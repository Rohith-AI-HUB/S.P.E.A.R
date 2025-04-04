import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";

function App() {
  const [theme, setTheme] = useState("theme1");

  // Code State (Shared Between LeftPanel & RightPanel)
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");

  // Input for Code Generation
  const [codePrompt, setCodePrompt] = useState("");

  // Speech Recognition State
  const [isMicOn, setIsMicOn] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("username")); // Check login state
  const [showLogin, setShowLogin] = useState(!localStorage.getItem("username"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || null);

  const themes = {
    theme1: { body: "#f5f5f5", header: "#ffffff", leftPanel: "#e3f2fd", rightPanel: "#f1f8e9" },
    theme2: { body: "#e0e0e0", header: "#d6d6d6", leftPanel: "#cfd8dc", rightPanel: "#d7ccc8" },
    theme3: { body: "#ffffff", header: "#f7f7f7", leftPanel: "#64b5f6", rightPanel: "#81c784" },
    theme4: { body: "#121212", header: "#212121", leftPanel: "#263238", rightPanel: "#37474f" },
    theme5: { body: "#f0f4c3", header: "#dce775", leftPanel: "#dcedc8", rightPanel: "#ffccbc" },
  };

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = "en-US";

      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCodePrompt(transcript);
        handleCodeSubmit();
      };

      speechRecognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
      };

      setRecognition(speechRecognition);
    } else {
      alert("Speech Recognition is not supported in this browser.");
    }
  }, []);

  const handleProfileClick = () => {
    setIsSidebarOpen(true);
  };

  // Logout and clear all user data
  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    localStorage.removeItem("profileImage");

    setIsLoggedIn(false);
    setShowLogin(true);
    setUsername("");
    setPassword("");
    setProfileImage(null);
    setIsSidebarOpen(false);
  };

  // Handle login
  const handleLoginSubmit = () => {
    if (username.trim() && password.trim()) {
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);
      setIsLoggedIn(true);
      setShowLogin(false);
      setIsSidebarOpen(false);
      alert("Logged in successfully!");
    } else {
      alert("Please enter both username and password!");
    }
  };

  // Handle profile image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem("profileImage", reader.result);
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Code Using AI
  const handleCodeSubmit = async () => {
    if (codePrompt.trim() !== "") {
      try {
        const response = await axios.post("http://localhost:5000/generate-code", { prompt: codePrompt });

        setHtmlCode(response.data.htmlCode);
        setCssCode(response.data.cssCode);
        setJsCode(response.data.jsCode);
        setCodePrompt("");
      } catch (error) {
        console.error("Error fetching code response:", error);
      }
    }
  };

  // Update Code via Chatbot (RightPanel)
  const handleCodeUpdate = (updatedHtml, updatedCss, updatedJs) => {
    setHtmlCode(updatedHtml || htmlCode);
    setCssCode(updatedCss || cssCode);
    setJsCode(updatedJs || jsCode);
  };

  const selectedTheme = themes[theme];

  return (
    <div className="app-container">
      <div style={{ backgroundColor: selectedTheme.body, transition: "background-color 0.3s ease" }}>
        <header className="header" style={{ backgroundColor: selectedTheme.header }}>
          <h1>S.P.E.A.R</h1>

          {/* Coding Input */}
          <div className="prompt-container">
            <input
              type="text"
              className="prompt-input"
              placeholder="Enter coding prompt..."
              value={codePrompt}
              onChange={(e) => setCodePrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
            />
            <button onClick={handleCodeSubmit}>Generate Code</button>
          </div>

          {/* Theme Selector */}
          <select className="theme-dropdown" value={theme} onChange={(e) => setTheme(e.target.value)}>
            {Object.keys(themes).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>

          <div className="Profile" onClick={handleProfileClick}></div>
        </header>

        {/* Sidebar */}
        <div className={`sidebar ${isSidebarOpen ? "open" : ""}`} style={{ zIndex: 9999 }}>
          <span className="close-btn" onClick={() => setIsSidebarOpen(false)}>
            &times;
          </span>
          {profileImage && <img src={profileImage} alt="Profile" className="profile-pic" />}
          <a href="#">Profile Info</a>
          <a href="#">Settings</a>
          {isLoggedIn ? (
            <a href="#" onClick={handleLogout}>Logout</a>
          ) : (
            <a href="#" onClick={() => setShowLogin(true)}>Login</a>
          )}
        </div>

        {/* Login Form */}
        {showLogin && (
          <div className="login-overlay">
            <div className="login-box">
              <h2>Login</h2>
              <input type="text" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <input type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              <button onClick={handleLoginSubmit}>Login</button>
            </div>
          </div>
        )}

        <div className="container">
          <LeftPanel 
            className={`${!isLoggedIn ? "blurred locked" : ""}`} 
            color={selectedTheme.leftPanel} 
            htmlCode={htmlCode} 
            cssCode={cssCode} 
            jsCode={jsCode} 
            onCodeChange={handleCodeUpdate} 
          />

          <RightPanel 
            className={`${!isLoggedIn ? "blurred locked" : ""}`} 
            color={selectedTheme.rightPanel} 
            htmlCode={htmlCode} 
            cssCode={cssCode} 
            jsCode={jsCode} 
            onUpdateCode={handleCodeUpdate} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
