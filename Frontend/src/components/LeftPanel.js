import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./LeftPanel.css";

function LeftPanel({ color, htmlCode, cssCode, jsCode, onCodeChange }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [localHtml, setLocalHtml] = useState(htmlCode);
  const [localCss, setLocalCss] = useState(cssCode);
  const [localJs, setLocalJs] = useState(jsCode);
  const [expanded, setExpanded] = useState(null);
  const [previewContent, setPreviewContent] = useState("");

  // Update local state when chatbot modifies the code
  useEffect(() => {
    setLocalHtml(htmlCode);
    setLocalCss(cssCode);
    setLocalJs(jsCode);
  }, [htmlCode, cssCode, jsCode]);

  // Update live preview when code changes
  useEffect(() => {
    updatePreview();
  }, [localHtml, localCss, localJs]);

  const updatePreview = () => {
    const combinedCode = `
      <html>
        <head>
          <style>${localCss}</style>
        </head>
        <body>
          ${localHtml}
          <script>
            try {
              ${localJs}
            } catch (error) {
              document.body.innerHTML += '<p style="color:red;">JS Error: ' + error.message + '</p>';
            }
          </script>
        </body>
      </html>
    `;
    setPreviewContent(combinedCode);
  };

  // Handle changes from textareas
  const handleHtmlChange = (e) => {
    setLocalHtml(e.target.value);
    onCodeChange(e.target.value, localCss, localJs);
  };
  
  const handleCssChange = (e) => {
    setLocalCss(e.target.value);
    onCodeChange(localHtml, e.target.value, localJs);
  };
  
  const handleJsChange = (e) => {
    setLocalJs(e.target.value);
    onCodeChange(localHtml, localCss, e.target.value);
  };
  

  const toggleExpand = (section) => {
    setExpanded(expanded === section ? null : section);
  };

  return (
    <div className="left-panel-wrapper">
      <div className={`left-panel-container ${isFlipped ? "flipped" : ""}`} style={{ backgroundColor: color }}>
        
        {/* Front Panel: Live Preview */}
        <div className="panel-face front">
          <div className="left-panel-header">
            <span>Frontend Logic Panel</span>
            <FontAwesomeIcon icon={faSyncAlt} className="flip-icon" onClick={() => setIsFlipped(!isFlipped)} />
          </div>
          <iframe className="Preview" srcDoc={previewContent} title="Live Preview"></iframe>
        </div>

        {/* Back Panel: Editable Code Sections */}
        <div className="panel-face back" style={{ backgroundColor: color }}>
          <div className="left-panel-header">
            <span>Generated Code</span>
            <FontAwesomeIcon icon={faSyncAlt} className="flip-icon" onClick={() => setIsFlipped(!isFlipped)} />
          </div>

          {/* HTML Section */}
          <div className={`code-editor-container ${expanded === "html" ? "expanded" : ""}`}>
            <h3 onClick={() => toggleExpand("html")}>HTML</h3>
            <SyntaxHighlighter language="html" style={atomDark}>
              {localHtml.trim()}
            </SyntaxHighlighter>
            <textarea className="code-editor" value={localHtml} onChange={handleHtmlChange} />
          </div>

          {/* CSS Section */}
          <div className={`code-editor-container ${expanded === "css" ? "expanded" : ""}`}>
            <h3 onClick={() => toggleExpand("css")}>CSS</h3>
            <SyntaxHighlighter language="css" style={atomDark}>
              {localCss.trim()}
            </SyntaxHighlighter>
            <textarea className="code-editor" value={localCss} onChange={handleCssChange} />
          </div>

          {/* JavaScript Section */}
          <div className={`code-editor-container ${expanded === "js" ? "expanded" : ""}`}>
            <h3 onClick={() => toggleExpand("js")}>JavaScript</h3>
            <SyntaxHighlighter language="javascript" style={atomDark}>
              {localJs.trim()}
            </SyntaxHighlighter>
            <textarea className="code-editor" value={localJs} onChange={handleJsChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftPanel;
