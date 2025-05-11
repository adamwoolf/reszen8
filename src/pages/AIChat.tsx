import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import OpenAI from 'openai';
import './AIChat.css';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const AIChat: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize OpenAI with your API key from environment variables
  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // Only for development
  });

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      // Add a system message if it's the first user message
      const conversation = messages.length === 0 
        ? [
            { role: 'system' as const, content: 'You are a helpful assistant.' },
            userMessage
          ]
        : [...messages, userMessage];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: conversation,
        max_tokens: 1000,
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: completion.choices[0]?.message?.content || 'Sorry, I could not process your request.'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error calling OpenAI API:', err);
      setError('Failed to get response from AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="ai-chat-container">
      <h1>AI Assistant</h1>
      <p className="ai-subtitle">Ask me anything and I'll do my best to help!</p>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Start a conversation with the AI assistant by typing a message below.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-content">
                <strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong>
                <p>{message.content}</p>
              </div>
            </div>
          ))
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
            aria-label="Type your message"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>
      
      <p className="ai-note">
        Note: This is a demo using OpenAI's API. Your conversations may be used to improve AI models.
      </p>
    </div>
  );
};

export default AIChat;
