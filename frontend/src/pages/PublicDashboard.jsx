// PublicDashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import "./CSS/PublicDashboard.css";

export default function PublicDashboard() {

  // ── Chatbot State ───────────────────────────────────────────────
  const [chatOpen,    setChatOpen]    = useState(false);
  const [messages,    setMessages]    = useState([
    { role: "assistant", content: "Hi! I'm the Herald College assistant. Ask me anything about enrollment, courses, fees, or location!" }
  ]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const chatEndRef = useRef(null);

  // ── Auto scroll to bottom ───────────────────────────────────────
  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatOpen]);

  // ── Send message ────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "human", content: input.trim() };
    const updatedHistory = [...messages, userMessage];

    setMessages(updatedHistory);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chatbot/chat/public/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:      userMessage.content,
          chat_history: messages.map(m => ({
            role:    m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.response }
      ]);

    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Handle enter key ────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const login = () => {};

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="public-dashboard">

      {/* ── All your existing sections unchanged ── */}
      {/* ... navbar, hero, about, features, herald, footer ... */}

      {/* ====================== CHATBOT ====================== */}

      {/* Chat toggle button */}
      <button
        className="chat-toggle-btn"
        onClick={() => setChatOpen(!chatOpen)}
      >
        {chatOpen ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {chatOpen && (
        <div className="chat-window">

          {/* Header */}
          <div className="chat-header">
            <span>🎓 Herald Assistant</span>
            <button onClick={() => setChatOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble ${msg.role === "human" ? "chat-bubble-user" : "chat-bubble-bot"}`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="chat-bubble chat-bubble-bot">
                Typing...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Ask about enrollment, fees, courses..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading}>
              Send
            </button>
          </div>

        </div>
      )}

    </div>
  );
}