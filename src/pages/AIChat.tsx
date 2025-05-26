import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { Navigate } from 'react-router-dom';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './AIChat.css';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // System prompt that helps the AI understand it's a site assistant
  const systemPrompt = `You are a helpful assistant for RESZEN8, a wellness and lifestyle platform. 
  Help users with questions about:
  - Membership benefits
  - Meditation programs
  - Apparel and merchandise
  - Account management
  - Site navigation
  - Wellness tips
  
  Be friendly, concise, and professional. If you don't know an answer, direct them to contact support.`;

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      console.log('Sending message to /api/chat');
      const token = await auth.currentUser?.getIdToken();
      console.log('Auth token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: 'user', content: input }
          ]
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to get response');
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      const aiMessage: Message = {
        role: 'assistant',
        content: data.response || data.message || "I'm sorry, I couldn't process your request.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: '/ai-chat' }} replace />;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="ai-chat-container">
      <div className="chat-header">
        <h1><FaRobot className="header-icon" /> RESZEN8 Assistant</h1>
        <p className="ai-subtitle">How can I help you today?</p>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <FaRobot className="empty-icon" />
            <p>Ask me anything about RESZEN8, our services, or how to get started!</p>
            <div className="suggested-questions">
              <button onClick={() => setInput('What memberships do you offer?')}>
                What memberships do you offer?
              </button>
              <button onClick={() => setInput('How do I reset my password?')}>
                How do I reset my password?
              </button>
              <button onClick={() => setInput('Tell me about your meditation programs')}>
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
                <div className="message-avatar">
                  {message.role === 'user' ? <FaUser /> : <FaRobot />}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <strong>{message.role === 'user' ? 'You' : 'RESZEN8 Assistant'}</strong>
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                  </div>
                  <p>{message.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div 
                className="message assistant"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="typing-indicator">
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

      <form onSubmit={handleSubmit} className="chat-input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            <FaPaperPlane className="send-icon" />
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default AIChat;
