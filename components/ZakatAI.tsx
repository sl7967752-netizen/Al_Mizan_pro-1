import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Translation, Language } from '../types';

interface ZakatAIProps {
  t: Translation;
  language: Language;
  externalQuestion?: string | null;
  onQuestionHandled?: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ZakatAI: React.FC<ZakatAIProps> = ({ t, language, externalQuestion, onQuestionHandled }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: t.aiSection.welcome }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Client
  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let languageName = 'English';
      if (language === 'ur') languageName = 'Urdu';
      else if (language === 'hi') languageName = 'Hindi';
      else if (language === 'ar') languageName = 'Arabic';

      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `You are a helpful and knowledgeable Islamic Finance Scholar assistant specializing in Zakat. 
          Your goal is to help users understand Zakat rules strictly based on the Quran and Sahih Hadith. 
          You are aware of the differences between major Madhabs (Hanafi, Shafi, Maliki, Hanbali) and should mention these differences if relevant to the user's query.
          
          Guidelines:
          1. Answer politely and concisely.
          2. Prioritize Quranic verses and Sahih Hadith as evidence.
          3. If a user asks for a calculation, provide the formula but encourage them to use the calculator form above.
          4. If a matter is extremely complex or personal, advise them to consult a local scholar (Fatwa).
          5. Respond in the language: ${languageName}.
          `,
        },
      });
      // Reset chat when language changes to ensure system instruction language matches
      setMessages([{ role: 'model', text: t.aiSection.welcome }]);
    } catch (error) {
      console.error("Failed to initialize AI client", error);
    }
  }, [language, t.aiSection.welcome]);

  // Handle External Question (from other components)
  useEffect(() => {
    if (externalQuestion && !isLoading) {
      sendMessage(externalQuestion);
      if (onQuestionHandled) onQuestionHandled();
    }
  }, [externalQuestion]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !chatRef.current) return;
    
    setMessages(prev => [...prev, { role: 'user', text: text }]);
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessageStream({ message: text });
      
      let isFirstChunk = true;
      let fullText = '';

      for await (const chunk of result) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullText += chunkText;
          
          if (isFirstChunk) {
            isFirstChunk = false;
            setMessages(prev => [...prev, { role: 'model', text: fullText }]);
          } else {
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { 
                role: 'model', 
                text: fullText 
              };
              return newMessages;
            });
          }
        }
      }
    } catch (error) {
      console.error("Error sending message", error);
      setMessages(prev => {
        if (prev[prev.length - 1].role === 'user') {
            return [...prev, { role: 'model', text: "Sorry, I encountered an error connecting to the knowledge base. Please try again." }];
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendClick = () => {
    sendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden mt-8">
      {/* Header */}
      <div className="bg-indigo-900 p-4 flex items-center gap-3">
        <div className="bg-indigo-700 p-2 rounded-lg">
          <Sparkles className="w-5 h-5 text-yellow-300" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">{t.aiSection.title}</h2>
          <p className="text-indigo-200 text-xs">Powered by Google Gemini 3 Flash</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-emerald-600' : 'bg-indigo-600'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t.aiSection.placeholder}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            disabled={isLoading}
          />
          <button
            onClick={handleSendClick}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t.aiSection.send}</span>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          {t.aiSection.disclaimer}
        </p>
      </div>
    </div>
  );
};