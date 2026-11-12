
import React, { useState, useRef, useEffect } from 'react';

import Sidebar from '../components/Sidebar';
import { apiRequest } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

import {
  Bot,
  Send,
  User,
  Sparkles,
  MessageCircle,
  Loader2,
  Trash2
} from 'lucide-react';

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm your FinAI Finance Assistant. 👋\n\nI can help you understand your income, expenses, savings, budgets and spending habits.\n\nWhat would you like to know about your finances?"
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
const { formatCurrency } = useCurrency();
  const messagesEndRef = useRef(null);



const formatChatMessage = (message) => {
  return message.replace(/₹\s?([\d,]+(?:\.\d{1,2})?)/g, (match, amount) => {
    const numericAmount = Number(amount.replace(/,/g, ''));
    return formatCurrency(numericAmount);
  });
};





  const suggestedQuestions = [
    'How much did I spend this month?',
    'How much am I saving this month?',
    'Which category do I spend the most on?',
    'Show me my budget summary',
    'Have I exceeded any budgets?',
    'Give me tips to reduce expenses'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, loading]);

  const sendMessage = async (question = input) => {
    const message = question.trim();

    if (!message || loading) {
      return;
    }

    setInput('');
    setError('');

    setMessages((previous) => [
      ...previous,
      {
        role: 'user',
        content: message
      }
    ]);

    setLoading(true);

    try {
      const result = await apiRequest('/api/chatbot/chat', {
        method: 'POST',
        body: JSON.stringify({
          message
        })
      });

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: result.reply
        }
      ]);
    } catch (err) {
      setError(err.message || 'Unable to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Hello again! I'm ready to help you with your finances. What would you like to know?"
      }
    ]);

    setError('');
    setInput('');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-8">

        {/* Header */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-indigo-100 p-3">
                <Bot size={26} className="text-indigo-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  AI Finance Assistant
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Your personal financial companion
                </p>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={clearChat}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <Trash2 size={16} />
            Clear Chat
          </button>

        </div>

        {/* Chat Container */}

        <div className="flex min-h-[600px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Chat Header */}

          <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-6 py-4">

            <div className="rounded-full bg-indigo-100 p-2">
              <Sparkles size={20} className="text-indigo-600" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                FinAI Assistant
              </h2>

              <p className="text-xs text-emerald-600">
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Ready to help
              </p>
            </div>

          </div>

          {/* Messages */}

          <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">

            {messages.map((message, index) => {
              const isUser = message.role === 'user';

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    isUser ? 'flex-row-reverse' : ''
                  }`}
                >

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    {isUser ? (
                      <User size={18} />
                    ) : (
                      <Bot size={19} />
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm sm:max-w-[75%] ${
                      isUser
                        ? 'rounded-tr-sm bg-blue-600 text-white'
                        : 'rounded-tl-sm border border-slate-100 bg-white text-slate-700'
                    }`}
                  >
                    <p className="whitespace-pre-line">
                      {isUser ? message.content : formatChatMessage(message.content)}
                    </p>
                  </div>

                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Bot size={19} />
                </div>

                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing your financial data...
                </div>

              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* Suggested Questions */}

          {messages.length === 1 && (
            <div className="border-t border-slate-100 bg-white px-4 py-5 sm:px-6">

              <div className="mb-3 flex items-center gap-2">
                <MessageCircle size={16} className="text-indigo-600" />

                <p className="text-sm font-semibold text-slate-700">
                  Suggested questions
                </p>
              </div>

              <div className="flex flex-wrap gap-2">

                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    disabled={loading}
                    className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-2 text-left text-xs text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}

              </div>

            </div>
          )}

          {/* Error */}

          {error && (
            <div className="border-t border-rose-100 bg-rose-50 px-6 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Message Input */}

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white p-4 sm:p-5"
          >

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">

              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask me anything about your finances..."
                maxLength={1000}
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>

            </div>

            <p className="mt-2 text-center text-xs text-slate-400">
              FinAI provides insights based on your recorded financial data.
            </p>

          </form>

        </div>

      </main>

    </div>
  );
}

export default Chatbot;
