"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./chat-widget.module.css";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

interface ChatResponse {
  response: string;
  intent?: string;
  confidence?: number;
  sessionId: string;
}

interface ChatRequest {
  message: string;
  sessionId: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (): Promise<void> => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const requestBody: ChatRequest = {
        message: inputValue,
        sessionId: "user-session-" + Date.now(), // You can implement proper session management
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.response || "Sorry, I didn't understand that.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, something went wrong. Please try again.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  const toggleChat = (): void => {
    setOpen(!open);
  };

  return (
    <>
      {open && (
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <div className={styles.headerContent}>
              <div className={styles.botAvatar}>🐾</div>
              <div className={styles.headerText}>
                <h3>Pet Assistant</h3>
                <span className={styles.status}>Online</span>
              </div>
            </div>
            <button
              className={styles.closeButton}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className={styles.messagesContainer}>
            {messages.length === 0 && (
              <div className={styles.welcomeMessage}>
                <div className={styles.botAvatar}>🐾</div>
                <p>
                  Hello! I&apos;m your Pet Assistant. How can I help you today?
                </p>
              </div>
            )}

            {messages.map((message: Message) => (
              <div
                key={message.id}
                className={`${styles.messageWrapper} ${
                  message.sender === "user"
                    ? styles.userMessage
                    : styles.botMessage
                }`}
              >
                {message.sender === "bot" && (
                  <div className={styles.botAvatar}>🐾</div>
                )}
                <div className={styles.messageContent}>
                  <p>{message.text}</p>
                  <span className={styles.timestamp}>{message.timestamp}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className={`${styles.messageWrapper} ${styles.botMessage}`}>
                <div className={styles.botAvatar}>🐾</div>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputContainer}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className={styles.messageInput}
              disabled={isLoading}
              aria-label="Type your message"
            />
            <button
              onClick={sendMessage}
              className={styles.sendButton}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
            >
              <span className={styles.sendIcon}>➤</span>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={toggleChat}
        className={styles.chatToggle}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}
