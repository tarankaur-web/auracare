import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const AIChatPage = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  const [showTyping, setShowTyping] = useState(false);

  const chatRef = useRef(null);

  // ✅ CONNECTED TO FLASK BACKEND
  const API = `${import.meta.env.VITE_API_URL}/chat`;

  const QUICK_RESPONSES = [
    "I'm feeling anxious",
    "I'm feeling sad",
    "I'm feeling joyful",
    "I'm stressed about school",
    "I need breathing exercises",
    "I'm having trouble sleeping"
  ];

  const getTimePeriod = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";

    return "evening";
  };

  const phraseRegex = (phrase) =>
    new RegExp(`(^|\\s)${phrase}(\\s|$)`);

  const getGreetingResponse = (text) => {
    const normalized = text.trim().toLowerCase();

    if (phraseRegex("good morning").test(normalized)) {
      return "Good morning! ☀️ How can I help you today?";
    }

    if (phraseRegex("good afternoon").test(normalized)) {
      return "Good afternoon! 🌤️ How can I support you today?";
    }

    if (phraseRegex("good evening").test(normalized)) {
      return "Good evening! 🌙 How are you feeling tonight?";
    }

    const simpleGreetings = [
      "hello",
      "hi",
      "hey",
      "hlo",
      "hiiii",
      "hiya"
    ];

    if (
      simpleGreetings.some((word) =>
        phraseRegex(word).test(normalized)
      )
    ) {
      return "Hello! 😊 I'm here for you. How can I help today?";
    }

    const farewells = [
      "bye",
      "goodbye",
      "good night",
      "see you",
      "by"
    ];

    if (
      farewells.some((word) =>
        phraseRegex(word).test(normalized)
      )
    ) {
      return "Take care! 👋 I'm always here for you.";
    }

    return null;
  };

  const getQuickResponseReply = (text) => {
    const normalized = text.trim().toLowerCase();

    if (/(anxious|anxiety|worried|nervous|panic|fearful)/.test(normalized)) {
      return "That sounds really difficult 😟 Try taking slow, deep breaths. You are safe and not alone.";
    }

    if (/(sad|depressed|down|unhappy|lonely|hopeless|tearful|blue)/.test(normalized)) {
      return "I'm sorry you're feeling sad 💛 It's okay to take things slowly today.";
    }

    if (/(joyful|happy|wonderful|excited|cheerful|grateful|blessed)/.test(normalized)) {
      return "That's wonderful to hear 😊 Keep enjoying the good moments and take care of yourself.";
    }

    if (/(stress|stressed|overwhelmed|pressure|deadline|exam|school)/.test(normalized)) {
      return "School or life stress can feel overwhelming 📚 Try breaking tasks into smaller steps and give yourself a short rest.";
    }

    if (/(sleep|sleeping|insomnia|can't sleep|cannot sleep|trouble sleeping)/.test(normalized)) {
      return "Try dimming lights and avoiding screens before bed 🌙 A calm bedtime routine can help you relax.";
    }

    if (/(breathe|breathing|breath)/.test(normalized)) {
      return "Try this 🌬️ Inhale for 4 seconds, hold for 4, exhale for 6. Repeat a few times and notice how your body feels.";
    }

    return null;
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight;
    }
  }, [messages, showTyping]);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("chatHistory") || "[]"
    );

    if (stored.length > 0) {
      setMessages(stored);
      setShowQuickResponses(false);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        "chatHistory",
        JSON.stringify(messages.slice(-50))
      );
    }
  }, [messages]);

  // ✅ FINAL BACKEND CONNECTED FUNCTION
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setMessages((prev) => [...prev, userMessage]);

    setInputMessage("");
    setShowTyping(true);
    setShowQuickResponses(false);

    // Greeting Reply
    const greetingReply = getGreetingResponse(text);

    if (greetingReply) {
      setTimeout(() => {
        setShowTyping(false);

        const botMessage = {
          text: greetingReply,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        };

        setMessages((prev) => [...prev, botMessage]);
        setShowQuickResponses(true);
      }, 700);

      return;
    }

    // Quick Replies
    const quickReply = getQuickResponseReply(text);

    if (quickReply) {
      setTimeout(() => {
        setShowTyping(false);

        const botMessage = {
          text: quickReply,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        };

        setMessages((prev) => [...prev, botMessage]);
        setShowQuickResponses(true);
      }, 700);

      return;
    }

    // ✅ BACKEND API CALL
    try {
      const res = await axios.post(API, {
        message: text
      });

      console.log("Backend Response:", res.data);

      const reply =
        res.data.response ||
        "I'm here to support you 💛";

      setTimeout(() => {
        setShowTyping(false);

        const botMessage = {
          text: reply,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        };

        setMessages((prev) => [...prev, botMessage]);

        setShowQuickResponses(true);
      }, 1000);

    } catch (error) {
      console.error(error);

      setShowTyping(false);

      const botMessage = {
        text:
          "Cannot connect to AI server ❌ Please check backend.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      setMessages((prev) => [...prev, botMessage]);
    }
  };

  const clearChat = () => {
    localStorage.removeItem("chatHistory");

    setMessages([]);
    setShowQuickResponses(true);
  };

  return (
    <div className="chat-wrapper">

      <div className="chat-box">

        {/* HEADER */}
        <div className="chat-header">
          <div>
            <strong>MindLink AI</strong>
            <div
              style={{
                fontSize: "12px",
                color: "green"
              }}
            >
              Online • Ready to help
            </div>
          </div>

          <button
            className="clear-button"
            onClick={clearChat}
          >
            Clear Chat
          </button>
        </div>

        {/* CHAT BODY */}
        <div className="chat-body" ref={chatRef}>

          {messages.length === 0 && (
            <div className="message-row bot">
              <div className="message-bubble">
                Hello 👋 I'm your AI wellness companion.
                How are you feeling today?
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message-row ${
                msg.isUser ? "user" : "bot"
              }`}
            >
              <div>
                <div className="message-bubble">
                  {msg.text}
                </div>

                <div className="timestamp">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {showTyping && (
            <div className="message-row bot">
              <div className="message-bubble">
                Typing...
              </div>
            </div>
          )}

        </div>

        {/* QUICK RESPONSES */}
        {showQuickResponses && (
          <div className="quick-responses">
            {QUICK_RESPONSES.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* INPUT */}
        <div className="chat-input">

          <textarea
            rows="1"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) =>
              setInputMessage(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                sendMessage(inputMessage);
              }
            }}
          />

          <button
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim()}
          >
            Send
          </button>

        </div>
      </div>
    </div>
  );
};

export default AIChatPage;