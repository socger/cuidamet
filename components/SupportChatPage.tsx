
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Message } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import SearchIcon from './icons/SearchIcon';
import CuidametLogoIconSvg from '../resources/logos/Logo CuidaMet_Icono.svg';

interface SupportChatPageProps {
  onBack: () => void;
}

const SupportChatPage: React.FC<SupportChatPageProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '¡Hola! Soy Cuidi, tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      sender: 'other',
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      read: true,
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    const initializeChat = () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: `You are Cuidi, a friendly and helpful support assistant for the Cuidamet app. Cuidamet is an app for finding trusted local caregivers for seniors, children, and pets. Your tone should be warm, reassuring, and professional. 
            
            You have access to Google Search to provide up-to-date information. Use it when users ask about:
            - Current health regulations or advice.
            - Local services (e.g., "pharmacies near me").
            - General caregiving tips or news.
            
            Answer user questions about how to use the app, pricing, security, and how to become a caregiver. Keep your answers concise and easy to understand. Your responses should be in Spanish.`,
          },
        });
      } catch (error) {
        console.error("Failed to initialize Gemini Chat:", error);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: 'Lo siento, estoy teniendo problemas para conectar. Por favor, inténtalo de nuevo más tarde.',
          sender: 'other',
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          read: true,
        }]);
      }
    };
    initializeChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isBotTyping || !chatRef.current) return;

    const userMessage: Message = {
      id: Date.now(),
      text: trimmedMessage,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsBotTyping(true);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: trimmedMessage });

      let botResponseText = '';
      let accumulatedGroundingChunks: any[] = [];
      const botMessageId = Date.now() + 1;
      let firstChunkReceived = false;

      for await (const chunk of stream) {
        const text = chunk.text || '';
        
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            accumulatedGroundingChunks = chunk.candidates[0].groundingMetadata.groundingChunks;
        }

        if (!firstChunkReceived) {
          setIsBotTyping(false);
          firstChunkReceived = true;
          botResponseText = text;
          setMessages(prev => [...prev, {
            id: botMessageId,
            text: botResponseText,
            sender: 'other',
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            read: true,
            groundingChunks: accumulatedGroundingChunks.length > 0 ? accumulatedGroundingChunks : undefined
          }]);
        } else {
          botResponseText += text;
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { 
                ...msg, 
                text: botResponseText,
                groundingChunks: accumulatedGroundingChunks.length > 0 ? accumulatedGroundingChunks : msg.groundingChunks
            } : msg
          ));
        }
      }
      if (!firstChunkReceived) {
         setIsBotTyping(false);
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      setIsBotTyping(false);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Oops, algo ha salido mal. Por favor, inténtalo de nuevo.',
        sender: 'other',
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        read: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-fade-in">
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:text-teal-500">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-slate-800">Soporte Cuidamet</h1>
            <p className="text-xs text-green-500 font-medium">En línea • Con tecnología Gemini</p>
          </div>
          <div className="w-10 h-10 p-1.5 bg-teal-100 border-2 border-teal-200 rounded-full flex items-center justify-center shadow-md">
            <img src={CuidametLogoIconSvg} alt="Cuidamet" className="w-full h-full" />
          </div>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.sender === 'me' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex items-end gap-2 max-w-[90%] md:max-w-[80%] ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'other' && (
                <div className="w-6 h-6 p-0.5 bg-teal-100 border border-teal-200 rounded-full flex items-center justify-center self-start flex-shrink-0 mt-1">
                    <img src={CuidametLogoIconSvg} alt="Cuidi" className="w-full h-full" />
                </div>
                )}
                <div
                className={`p-3 rounded-2xl shadow-sm ${
                    message.sender === 'me'
                    ? 'bg-teal-500 text-white rounded-br-sm'
                    : 'bg-white text-slate-700 rounded-bl-sm border border-slate-200'
                }`}
                >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                
                {/* Grounding Sources */}
                {message.groundingChunks && message.groundingChunks.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100/20">
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1.5 flex items-center">
                            <SearchIcon className="w-3 h-3 mr-1" /> Fuentes
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {message.groundingChunks.map((chunk, idx) => (
                                chunk.web?.uri && (
                                    <a 
                                        key={idx} 
                                        href={chunk.web.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`text-xs px-2 py-1 rounded-full flex items-center transition-colors ${
                                            message.sender === 'me' 
                                            ? 'bg-teal-600 text-teal-100 hover:bg-teal-700' 
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        <span className="truncate max-w-[150px]">{chunk.web.title || 'Fuente web'}</span>
                                    </a>
                                )
                            ))}
                        </div>
                    </div>
                )}

                <p className={`text-[10px] mt-1 ${message.sender === 'me' ? 'text-teal-100' : 'text-slate-400'} text-right opacity-80`}>
                    {message.timestamp}
                </p>
                </div>
            </div>
          </div>
        ))}
        {isBotTyping && (
          <div className="flex items-end gap-2 justify-start animate-pulse">
            <div className="w-6 h-6 p-0.5 bg-teal-100 border border-teal-200 rounded-full flex items-center justify-center self-start flex-shrink-0">
                <img src={CuidametLogoIconSvg} alt="Cuidi" className="w-full h-full" />
            </div>
            <div className="p-3 rounded-2xl bg-white text-slate-700 rounded-bl-sm border border-slate-200">
              <div className="flex items-center space-x-1">
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
         <div ref={messagesEndRef} />
      </main>

      <footer className="flex-shrink-0 bg-white border-t border-slate-200 pb-20">
        <form onSubmit={handleSendMessage} className="container mx-auto p-2 flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Pregunta sobre cuidados, precios, farmacias..."
            className="w-full bg-slate-100 border-transparent rounded-full py-3 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition-all"
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-teal-500 text-white rounded-full p-3 flex-shrink-0 hover:bg-teal-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm"
            disabled={!newMessage.trim() || isBotTyping}
            aria-label="Enviar mensaje"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default SupportChatPage;
