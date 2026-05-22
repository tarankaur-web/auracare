import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const AIChatPage = () => {

  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  const [showTyping, setShowTyping] = useState(false);

  const chatRef = useRef(null);

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
      "hii",
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

  // AUTO SCROLL
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, showTyping]);

  // LOAD CHAT HISTORY
  useEffect(() => {
    const persisted = JSON.parse(
      localStorage.getItem("chatHistory") || "[]"
    );

    if (persisted.length > 0) {
      setMessages(persisted);
      setShowQuickResponses(false);
    }
  }, []);

  // SAVE CHAT HISTORY
  useEffect(() => {
    if (messages.length) {
      const last50 = messages.slice(-50);

      localStorage.setItem(
        "chatHistory",
        JSON.stringify(last50)
      );
    }
  }, [messages]);

  // SEND MESSAGE
  const sendMessage = async (text) => {

    if (!text.trim()) return;

    // USER MESSAGE
    const userMessage = {
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setMessages((prev) => [
      ...prev,
      userMessage
    ]);

    setInputMessage("");
    setShowQuickResponses(false);
    setShowTyping(true);

    const greetingReply = getGreetingResponse(text);
    const quickReply = getQuickResponseReply(text);

    if (greetingReply || quickReply) {
      const replyText = greetingReply || quickReply;

      setTimeout(() => {
        setShowTyping(false);

        const botMessage = {
          text: replyText,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        };

        setMessages((prev) => [
          ...prev,
          botMessage
        ]);

        setShowQuickResponses(true);
      }, 700);

      return;
    }

    try {

      // SEND TO FLASK BACKEND
      const response = await axios.post(
        "http://localhost:5000/chat",
        {
          message: text
        }
      );

      console.log(response.data);

      // BOT MESSAGE
      const botMessage = {
        text: response.data.response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      setTimeout(() => {

        setShowTyping(false);

        setMessages((prev) => [
          ...prev,
          botMessage
        ]);

        setShowQuickResponses(true);

      }, 1200);

    } catch (error) {

      console.log(error);

      setShowTyping(false);

      const errorMessage = {
        text: "Unable to connect to AI backend.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      setMessages((prev) => [
        ...prev,
        errorMessage
      ]);
    }
  };

  // CLEAR CHAT
  const clearChat = () => {

    if (
      window.confirm(
        "Are you sure you want to clear chat history?"
      )
    ) {

      localStorage.removeItem("chatHistory");

      setMessages([]);

      setShowQuickResponses(true);
    }
  };

  return (
    <div className="chat-wrapper">

      <style>{`

        .chat-box-animate {
          opacity: 0;
          transform: translateY(30px);
          animation: slideUpFade 1s ease forwards;
        }

        @keyframes slideUpFade {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-wrapper {
          padding: 20px;
          min-height: 100vh;
          background: linear-gradient(140deg, #e9e3fb, #d7efe4);
          display: flex;
          justify-content: center;
          box-sizing: border-box;
        }

        .chat-box {
          width: 820px;
          height: 78vh;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.09);
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          background: #e6defa;
          padding: 18px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bot-avatar {
          width:45px;
          height:45px;
          border-radius:50%;
          background:#009FD9;
          display:flex;
          justify-content:center;
          align-items:center;
          font-size:22px;
          color:white;
          margin-right:10px;
        }

        .chat-body {
          padding:14px 20px;
          flex:1;
          overflow-y:auto;
        }

        .message-row {
          display:flex;
          flex-direction:column;
          margin-bottom:14px;
          animation:fadeInBubble 0.5s ease;
        }

        .message-row.user {
          align-items:flex-end;
        }

        .message-row.bot {
          align-items:flex-start;
        }

        .message-bubble {
          max-width:75%;
          padding:12px 16px;
          font-size:14px;
          white-space:pre-wrap;
          border-radius:18px;
        }

        .bot .message-bubble {
          background:#d3e8fb;
          color:#000;
          border-bottom-left-radius:0;
        }

        .user .message-bubble {
          background:#5DBAAD;
          color:#fff;
          border-bottom-right-radius:0;
        }

        .timestamp {
          font-size:11px;
          color:#666;
          margin-top:4px;
        }

        .quick-responses {
          padding:12px 16px;
          border-top:1px solid #eee;
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          background:#fff;
        }

        .quick-responses button {
          background:#FFEAD8;
          padding:8px 16px;
          border:none;
          border-radius:18px;
          font-size:13px;
          color:#5d3d29;
          cursor:pointer;
        }

        .chat-input {
          padding:12px 16px;
          border-top:1px solid #eee;
          background:#fff;
          display:flex;
          gap:12px;
        }

        .chat-input textarea {
          flex:1;
          padding:10px 14px;
          resize:none;
          font-size:14px;
          border:1px solid #ccc;
          border-radius:10px;
          color:#000;
        }

        .chat-input button {
          background:#68b7b2;
          color:#fff;
          font-weight:600;
          padding:10px 22px;
          border:none;
          border-radius:10px;
          cursor:pointer;
        }

      `}</style>

      <div className="chat-box chat-box-animate">

        <div className="chat-header">

          <div style={{
            display: "flex",
            alignItems: "center"
          }}>

            <div className="bot-avatar">
              🤖
            </div>

            <div>
              <div style={{ color: 'black' }}>
                <strong>Mindlink</strong>
              </div>

              <div style={{
                fontSize: '12px',
                color: 'green'
              }}>
                Online • AI Support
              </div>
            </div>

          </div>

          <button
            className="clear-button"
            onClick={clearChat}
            style={{ color: 'black' }}
          >
            Clear Chat
          </button>

        </div>

        <div className="chat-body" ref={chatRef}>

          {messages.length === 0 && (
            <div className="message-row bot">

              <div className="message-bubble">
                Hi there! I'm MindBot 😊
                <br /><br />
                I'm here to support your mental wellness.
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

              <div className="message-bubble">
                {msg.text}
              </div>

              <div className="timestamp">
                {msg.timestamp}
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

        <div className="chat-input">

          <textarea
            rows="1"
            placeholder="Type your message here..."
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
            onClick={() =>
              sendMessage(inputMessage)
            }
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