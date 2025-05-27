import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";
import { FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "./AIChat.css";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPrompts, setShowPrompts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const promptButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // System prompt that helps the AI understand it's a site assistant
  const systemPrompt = `You are a helpful assistant for RESZEN8, a wellness and lifestyle platform. 
  Your primary role is to assist users with questions specifically about RESZEN8 and its services.
  
  You should ONLY answer questions about:
  - RESZEN8 membership benefits and plans
  - Meditation and wellness programs
  - Apparel and merchandise available on RESZEN8
  - Account management and subscription details
  - Site navigation and features
  - Wellness tips and guidance related to RESZEN8's offerings
  
  If asked about any other topics not related to RESZEN8, politely decline to answer and redirect the conversation back to RESZEN8's services.
  
  Be friendly, professional, and concise in your responses. If you don't know the answer to a RESZEN8-related question, direct them to contact support.`;

  // Common prompts for RESZEN8
  const commonPrompts = [
    {
      category: "Getting Started",
      prompts: [
        "What is RESZEN8 and what do you offer?",
        "How do I sign up for RESZEN8?",
        "What are the system requirements?",
        "Is there a free trial available?",
        "How do I install the RESZEN8 app?",
        "What makes RESZEN8 different from other solutions?",
      ],
    },
    {
      category: "Features & Services",
      prompts: [
        "What are the key features of RESZEN8?",
        "Do you offer mobile access?",
        "Can I integrate RESZEN8 with other tools?",
        "What kind of analytics does RESZEN8 provide?",
        "Is my data secure with RESZEN8?",
        "Do you offer API access?",
      ],
    },
    {
      category: "Pricing & Plans",
      prompts: [
        "What are the pricing plans for RESZEN8?",
        "Is there an enterprise plan?",
        "What payment methods do you accept?",
        "Can I upgrade or downgrade my plan?",
        "Is there a discount for annual billing?",
        "What happens if I exceed my plan limits?",
      ],
    },
    {
      category: "Support & Help",
      prompts: [
        "How do I contact customer support?",
        "Where can I find tutorials?",
        "Do you offer training for new users?",
        "How do I reset my password?",
        "Where can I find documentation?",
        "What are your support hours?",
      ],
    },
    {
      category: "Account Management",
      prompts: [
        "How do I update my account information?",
        "How do I add team members?",
        "How do I change my plan?",
        "How do I cancel my subscription?",
        "How do I export my data?",
        "How do I delete my account?",
      ],
    },
  ];

  // Toggle prompts dropdown
  const togglePrompts = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPrompts((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (promptButtonRef.current && !promptButtonRef.current.contains(e.target as Node)) {
        // setShowPrompts(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle prompt selection
  const handlePromptSelect = async (prompt: string) => {
    // Close the dropdown
    setShowPrompts(false);

    // Create and add user message
    const userMessage: Message = {
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);

    // Process the message to get AI response
    try {
      setIsLoading(true);
      const token = await auth.currentUser?.getIdToken();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const aiMessage: Message = {
        role: "assistant",
        content: data.response || data.message || "I'm sorry, I couldn't process your request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error processing message:", err);
      setError("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Process the message and get AI response
  const processMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const token = await auth.currentUser?.getIdToken();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: "user", content: message },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const aiMessage: Message = {
        role: "assistant",
        content: data.response || data.message || "I'm sorry, I couldn't process your request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error processing message:", err);
      setError("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      console.log("Sending message to /api/chat");
      const token = await auth.currentUser?.getIdToken();
      console.log("Auth token:", token ? "Token exists" : "No token");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: "user", content: input },
          ],
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      console.log("API Response:", data);

      const aiMessage: Message = {
        role: "assistant",
        content: data.response || data.message || "I'm sorry, I couldn't process your request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err instanceof Error ? err.message : "Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (messages.length > 0 && window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className='ai-chat-container'>
      <div className='chat-header'>
        <h1>
          <FaRobot className='header-icon' /> RESZEN8 Assistant
        </h1>
        <p className='ai-subtitle'>How can I help you today?</p>
      </div>

      <div className='chat-messages'>
        {messages.length === 0 ? (
          <div className='empty-state'>
            <FaRobot className='empty-icon' />
            <p>Ask me anything about RESZEN8, our services, or how to get started!</p>
            <div className='suggested-questions'>
              <button
                onClick={() => {
                  const message = "What memberships do you offer?";
                  const userMessage: Message = {
                    role: "user",
                    content: message,
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, userMessage]);
                  processMessage(message);
                }}
              >
                What memberships do you offer?
              </button>
              <button
                onClick={() => {
                  const message = "How do I reset my password?";
                  const userMessage: Message = {
                    role: "user",
                    content: message,
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, userMessage]);
                  processMessage(message);
                }}
              >
                How do I reset my password?
              </button>
              <button
                onClick={() => {
                  const message = "Tell me about your meditation programs";
                  const userMessage: Message = {
                    role: "user",
                    content: message,
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, userMessage]);
                  processMessage(message);
                }}
              >
                Tell me about your meditation programs
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                className={`message ${message.role}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className='message-avatar'>{message.role === "user" ? <FaUser /> : <FaRobot />}</div>
                <div className='message-content'>
                  <div className='message-header'>
                    <strong>{message.role === "user" ? "You" : "RESZEN8 Assistant"}</strong>
                    <span className='message-time'>{formatTime(message.timestamp)}</span>
                  </div>
                  <p>{message.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div className='message assistant' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className='message-avatar'>
                  <FaRobot />
                </div>
                <div className='typing-indicator'>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className='chat-input-container'>
        <div className='input-wrapper'>
          <input
            type='text'
            value={input}
            ref={inputRef}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type your message here...'
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type='button'
            className='prompt-button'
            onClick={() => setShowPrompts(!showPrompts)}
            ref={promptButtonRef}
          >
            <span>💡</span>
          </button>
          <div className='button-group'>
            <button
              type='button'
              onClick={handleClearChat}
              disabled={messages.length === 0 || isLoading}
              className='clear-button'
              title='Clear chat'
            >
              Clear
            </button>
            <button type='submit' disabled={isLoading || !input.trim()} className='send-button' title='Send message'>
              <FaPaperPlane className='send-icon' />
            </button>
          </div>
        </div>

        {/* Common Questions Dropdown */}
        <div className='prompts-container'>
          <button ref={promptButtonRef} className='prompts-toggle' onClick={togglePrompts} type='button'>
            {showPrompts ? "Hide Common Questions" : "Show Common Questions"}
          </button>

          {showPrompts && (
            <div className='prompts-dropdown'>
              {commonPrompts.map((section, sectionIndex) => (
                <div key={sectionIndex} className='prompt-section'>
                  <div className='prompt-category'>{section.category}</div>
                  {section.prompts.map((prompt, promptIndex) => (
                    <button
                      key={`${sectionIndex}-${promptIndex}`}
                      id={`prompt-${sectionIndex}-${promptIndex}`}
                      name={`prompt-${section.category.toLowerCase().replace(/\s+/g, "-")}`}
                      className='prompt-item'
                      onClick={(e) => {
                        console.log("Button clicked, preventing default");
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Prompt selected:", prompt);

                        handlePromptSelect(prompt);
                      }}
                      onMouseDown={(e) => {
                        // Prevent focus stealing if needed
                        e.preventDefault();
                      }}
                      type='button'
                      aria-label={`Select question: ${prompt}`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className='error-message'>{error}</div>}
      </form>
    </div>
  );
};

export default AIChat;
