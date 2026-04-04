import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/authcontext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./CSS/ChatBot.css";

export default function ChatBot() {
  const { accessToken, api } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      type: "bot", 
      text: "Hi! 👋 I'm your Academic Assistant. I can help you find resources, answer questions about your courses, and more. What would you like to know?" 
    }
  ]);
  const [chatHistory, setChatHistory] = useState([]); 
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    // Add user message to UI
    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/chatbot/chat/",
        {
          message: text,
          chat_history: chatHistory,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const { response, chat_history } = res.data;

      // Add bot response to UI
      setMessages((prev) => [...prev, { type: "bot", text: response }]);

      // Update chat history with what backend returned
      setChatHistory(chat_history);

    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { type: "bot", text: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Custom markdown components for better table rendering
  const MarkdownComponents = {
    table: ({ children }) => (
      <div className="markdown-table-wrapper">
        <table className="markdown-table">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="markdown-th">{children}</th>,
    td: ({ children }) => <td className="markdown-td">{children}</td>,
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <code className="markdown-code-block" {...props}>
          {children}
        </code>
      ) : (
        <code className="markdown-inline-code" {...props}>
          {children}
        </code>
      );
    },
    a: ({ href, children }) => (
      <a href={href} className="markdown-link" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className="markdown-list">{children}</ul>,
    ol: ({ children }) => <ol className="markdown-list ordered">{children}</ol>,
    li: ({ children }) => <li className="markdown-list-item">{children}</li>,
    blockquote: ({ children }) => <blockquote className="markdown-quote">{children}</blockquote>,
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`chat-fab ${isOpen ? 'hidden' : ''}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Chat Panel */}
      <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="chat-header-info">
            <p className="chat-header-title">Academic Assistant</p>
            <p className="chat-header-status">
              <span className="status-dot" />
              Online
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="chat-close-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages Container */}
        <div className="chat-messages-container" ref={chatContainerRef}>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message-wrapper ${msg.type}`}>
                <div className={`message-bubble ${msg.type}`}>
                  {msg.type === "bot" ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={MarkdownComponents}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    <p className="message-text">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="message-wrapper bot">
                <div className="typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={autoResize}
            placeholder="Ask me anything about your courses..."
            rows={1}
            className="chat-input"
          />
          <button
            onClick={sendMessage}
            disabled={isTyping || !input.trim()}
            className={`chat-send-btn ${(!input.trim() || isTyping) ? 'disabled' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}