import React, { useState, useEffect, useRef } from "react";
import { gql } from "@apollo/client/core/index.js";
import { useMutation, useSubscription } from "@apollo/client/react/index.js";

const SEND_MESSAGE = gql`
  mutation SendMessage($text: String!, $sender: String!) {
    sendMessage(text: $text, sender: $sender) {
      id
      text
      sender
      time
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageAdded {
    messageAdded {
      id
      text
      sender
      time
    }
  }
`;

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef(null);

  const [myId] = useState(() => "User-" + Math.floor(Math.random() * 1000));

  const [sendMessage] = useMutation(SEND_MESSAGE);

  useSubscription(MESSAGE_SUBSCRIPTION, {
    onData: ({ data }) => {
      const newMessage = data.data?.messageAdded;
      if (newMessage) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    },
    onError: (err) => console.error("Subscription hatası:", err),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      await sendMessage({
        variables: {
          text: inputValue,
          sender: myId,
        },
      });
      setInputValue("");
    } catch (err) {
      console.error("Mesaj gönderilemedi:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      <header className="bg-indigo-600 text-white p-4 shadow-lg flex items-center justify-between z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Anonymous Chat</h1>
          <p className="text-[10px] opacity-80 font-mono">ID: {myId}</p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-500/30 px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
          <span className="text-xs font-medium uppercase tracking-widest">
            Canlı
          </span>
        </div>
      </header>

      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 mb-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025 4.417 4.417 0 00-.115-1.612C3.883 15.93 3 14.06 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
            <p className="italic">Sohbeti başlatmak için bir mesaj yazın...</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === myId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] md:max-w-md p-3 rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                msg.sender === myId
                  ? "bg-indigo-600 text-white rounded-tr-none border-indigo-700"
                  : "bg-white text-slate-800 rounded-tl-none border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1 gap-4">
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">
                  {msg.sender === myId ? "Sen" : msg.sender}
                </span>
                <span className="text-[9px] opacity-50 font-medium">
                  {msg.time}
                </span>
              </div>
              <p className="text-sm md:text-base leading-relaxed break-words">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </main>

      <footer className="bg-white border-t border-slate-200 p-4 pb-6 md:pb-4">
        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto flex items-center gap-3"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Mesajınızı gönderin..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-5 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm shadow-inner"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-xl shadow-md active:scale-90 transition-all flex items-center justify-center disabled:opacity-50"
            disabled={!inputValue.trim()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default App;
