import React, { useState, useEffect } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { FaPaperPlane } from "react-icons/fa";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";
import "./RightPanel.css";

function RightPanel({ color, htmlCode, cssCode, jsCode, onUpdateCode }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isMicOn, setIsMicOn] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]); // Stores chat messages

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = "en-US";

      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handlePromptSubmit(transcript);
      };

      speechRecognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
      };

      setRecognition(speechRecognition);
    } else {
      alert("Speech Recognition is not supported in this browser.");
    }
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const toggleMic = () => {
    if (!recognition) return;
    isMicOn ? recognition.stop() : recognition.start();
    setIsMicOn(!isMicOn);
  };

  const handlePromptSubmit = async (inputPrompt = prompt) => {
    if (!inputPrompt.trim()) return;
  
    const userMessage = { sender: "user", text: inputPrompt };
    setMessages((prev) => [...prev, userMessage]); // Append user message
    setPrompt(""); // Clear input
  
    try {
      const response = await axios.post(
        "http://localhost:5000/chat",
        { message: inputPrompt, htmlCode, cssCode, jsCode }, // Send current code state
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.status === 200 && response.data) {
        let botMessage = { sender: "bot", text: response.data.reply || "✅ Code updated successfully." };
        
        try {
          const parsedResponse = JSON.parse(response.data.reply); // Parse code updates
          const { htmlCode: newHtml, cssCode: newCss, jsCode: newJs } = parsedResponse;
  
          if (newHtml || newCss || newJs) {
            onUpdateCode(newHtml || htmlCode, newCss || cssCode, newJs || jsCode); // Update LeftPanel
            botMessage.text = "✅ Code applied successfully!";
          }
        } catch (error) {
          // If it's a normal conversation, do nothing
        }
  
        setMessages((prev) => [...prev, botMessage]); // Append bot response
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ No response from bot." }]);
      }
    } catch (error) {
      console.error("Error fetching bot response:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "❌ Error: Unable to fetch response." }]);
    }
  };
  

  return (
    <div className="right-panel-wrapper">
      <div className={`right-panel-container ${isFlipped ? "flipped" : ""}`} style={{ backgroundColor: color }}>
        
        {/* Front Panel: Chat Interface */}
        <div className="panel-face front">
          <div className="right-panel-header">
            <span>Chat Assistant</span>
            <FontAwesomeIcon icon={faSyncAlt} className="flip-icon" onClick={handleFlip} />
          </div>

          <div className="right-panel-container1">
            {/* Input Box */}
            <div className="input-box-container">
              <input
                type="text"
                className="input-box"
                placeholder="Type your message..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePromptSubmit()}
              />
              <button className="send-button" onClick={() => handlePromptSubmit()}>
                <FaPaperPlane className="send-button-icon" />
              </button>
              <button className="mic-button" onClick={toggleMic}>
                {isMicOn ? <AiFillAudio size={24} color="green" /> : <AiOutlineAudioMuted size={24} color="red" />}
              </button>
            </div>

            {/* Chat Conversation */}
            <ScrollToBottom className="chat-container">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
            </ScrollToBottom>
          </div>
        </div>

        {/* Back Panel: Code Output (Optional) */}
        <div className="panel-face back" style={{ backgroundColor: color }}>
          <div className="right-panel-header">
            <span>Response</span>
            <FontAwesomeIcon icon={faSyncAlt} className="flip-icon" onClick={handleFlip} />
          </div>
          <div className="code-editor-container">
            <pre className="code-editor">
              <code>{displayedText || "No Response Yet."}</code>
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RightPanel;
