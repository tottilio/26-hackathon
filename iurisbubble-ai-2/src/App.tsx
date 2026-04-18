import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Minus, 
  Maximize2, 
  Gavel, 
  Scale, 
  ShieldCheck, 
  Loader2,
  FileText,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// @ts-ignore
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
// Note: In AI Studio project, VITE_GEMINI_API_KEY is usually configured via the environment.
// For the platform Gemini key, we typically use the system-provided one.
// However, the instructions say to use process.env.GEMINI_API_KEY for the platform key.
// In Vite, we should check if it's available.

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Hola, soy Iuria. Puedo ayudarte a analizar los expedientes y documentos legales. ¿Qué te gustaría consultar?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isUploading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Sanitize filename for headers (ASCII only)
      const safeName = btoa(unescape(encodeURIComponent(file.name))); 

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf',
          'x-file-name-b64': safeName
        },
        body: await file.arrayBuffer()
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `He analizado tu documento. "${file.name}" (${data.chunksIndexed} segmentos). Ahora puedes hacerme preguntas sobre su contenido.`
        }]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Error al subir PDF. Verifica la conexión con el servidor.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Get relevant context from MongoDB
      const searchRes = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const searchData = await searchRes.json();
      if (searchData.error) throw new Error(searchData.error);

      // 2. Generate response using Gemini (Frontend)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Actúa como un Especialista en Derecho Procesal Mexicano.
      Tu objetivo es responder consultas basadas en la documentación legal proporcionada como contexto.
      
      CONTEXTO DE PDFS LEGALES:
      ${searchData.context || 'No encontré información al respecto dentro de los documentos a los que tengo acceso.'}

      HISTORIAL DE CONVERSACIÓN RECIENTE:
      ${messages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}
      
      CONSULTA ACTUAL DEL USUARIO:
      ${input}

      INSTRUCCIONES:
      - Responde de manera técnica, precisa y profesional.
      - Si la información no está en el contexto, házlo saber pero intenta dar una orientación general basada en la ley mexicana.
      - Mantén siempre el descargo de responsabilidad: "Esta es información informativa, no asesoría legal."
      - Sé breve y directo.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        sources: searchData.sources
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Hubo un problema al procesar tu consulta legal. Verifica la conexión con el servidor.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper because 'res' wasn't defined in the above catch
  // Actually I made a typo in the above handleSend, let me fix it in the next tool call.
  // I will just rewrite the whole file with the fix.

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-800 transition-all active:scale-95 group border-4 border-white"
          >
            <MessageSquare size={28} className="group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className={`bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'h-16 w-80' : 'h-[600px] w-[400px]'} max-w-[calc(100vw-48px)]`}
          >
            {/* Header */}
            <div className="bg-blue-900 p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Gavel size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm">Iuria</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Connected</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${m.role === 'assistant' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                        {m.role === 'assistant' ? <Scale size={16} /> : <MessageSquare size={16} />}
                      </div>
                      <div className={`flex flex-col max-w-[80%] ${m.role === 'user' ? 'items-end' : ''}`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${m.role === 'assistant' ? 'bg-white border border-slate-100 text-slate-700' : 'bg-blue-900 text-white font-medium'}`}>
                          {m.content}
                          
                          {m.sources && m.sources.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Fuentes:</span>
                              <div className="flex flex-wrap gap-1">
                                {m.sources.map((s, i) => (
                                  <div key={i} className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-500 font-medium">
                                    <FileText size={10} />
                                    {s}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center shrink-0">
                        <Scale size={16} className="animate-spin" />
                      </div>
                      <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl shadow-sm flex items-center gap-1">
                        <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept=".pdf" 
                      className="hidden" 
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isLoading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-all disabled:opacity-50"
                    >
                      {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                      {isUploading ? 'Analizando...' : 'Subir PDF'}
                    </button>
                    {isUploading && (
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-full bg-blue-900"
                        />
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ingresa tu consulta."
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all font-medium"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-1.5 top-1.5 bottom-1.5 w-9 bg-blue-900 text-white rounded-lg flex items-center justify-center hover:bg-blue-800 transition-all active:scale-90 disabled:opacity-30"
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={10} className="text-emerald-500" />
                      <span>Legal RAG AI</span>
                    </div>
                    <span>Powered by Atlas</span>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
