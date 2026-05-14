/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  ArrowLeft, 
  Smile, 
  Paperclip, 
  Camera, 
  Mic,
  CheckCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithFouad } from './services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'fouad';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'يا خبيير.. وينك؟ ليش تراسلني بهذا الوقت؟',
      sender: 'fouad',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'read'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState('اليوم الساعة 3:15 م');
  const [notification, setNotification] = useState<string | null>(null);
  const [appLocked, setAppLocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic Status Logic
  useEffect(() => {
    const statusInterval = setInterval(() => {
      const chance = Math.random();
      if (chance < 0.15) {
        setIsOnline(prev => !prev);
        if (isOnline) {
          const funnyTimes = ['الآن', 'بيخزن', 'راقد', 'يشحن', 'ضاع الشاحن', 'بيصلي'];
          setLastSeen(funnyTimes[Math.floor(Math.random() * funnyTimes.length)]);
        }
      }

      // Dynamic Lock Logic (Fouad is stubborn and closes the app)
      if (Math.random() < 0.02 && !appLocked) {
        setAppLocked(true);
        // Reopens after 10 seconds of "one hour" simulation
        setTimeout(() => setAppLocked(false), 10000); 
      }
    }, 5000);

    return () => clearInterval(statusInterval);
  }, [isOnline, appLocked]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const showNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      setTimeout(() => {
        setMessages(prev => 
          prev.map(m => m.id === userMessage.id ? { ...m, status: 'delivered' } : m)
        );
      }, 1000);

      setTimeout(() => {
        setMessages(prev => 
          prev.map(m => m.id === userMessage.id ? { ...m, status: 'read' } : m)
        );
      }, 1500);

      const chatHistory = messages.slice(-5).map(m => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text
      }));
      chatHistory.push({ role: 'user', text: inputValue });

      const fouadResponse = await chatWithFouad(chatHistory);

      const fouadMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fouadResponse || "ما بش هدرة.. النت ضايع!",
        sender: 'fouad',
        timestamp: new Date(),
        status: 'read'
      };

      setMessages(prev => [...prev, fouadMessage]);
      showNotification(`رسالة من فؤاد: ${fouadResponse?.substring(0, 30)}...`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  if (appLocked) {
    return (
      <div className="h-screen bg-[#075e54] flex flex-col items-center justify-center p-8 text-white text-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
            <Phone className="w-12 h-12" />
          </div>
        </motion.div>
        <h1 className="text-2xl font-bold mb-4" dir="rtl">التطبيق مقفل للراحة!</h1>
        <p className="text-lg opacity-90 leading-relaxed font-medium" dir="rtl">
          "يا خبير، أنا الآن مخزن وقدي القهوة في الراس. لا عاد تزعجنيش.. ارجع بعد ساعة ولا ثنتين لما أصحصح. الشاشة مكسورة أصلاً والنت غالي!" 
          <br /><br />
          - فؤاد الفروي الملك
        </p>
        <div className="mt-8 animate-pulse text-sm">جاري محاولة الاتصال بـ فؤاد...</div>
        <button onClick={() => setAppLocked(false)} className="mt-6 text-[10px] underline opacity-40">تخطى (فقط للمطورين)</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#efeae2] font-sans overflow-hidden">
      {/* Notification Section */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} 
            animate={{ y: 20, opacity: 1 }} 
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-gray-100"
          >
            <div className="w-10 h-10 rounded-full bg-orange-500 overflow-hidden shrink-0">
              <img src="https://ais-pre-jrn46qsxq3dhyfomad2wb4-219901023280.europe-west2.run.app/fouad_al_farwi.png" alt="F" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 overflow-hidden" dir="rtl">
              <div className="font-bold text-xs text-gray-500">طاصاب - فؤاد الملك</div>
              <div className="text-sm truncate font-medium text-gray-800">{notification}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Header */}
      <header className="h-16 bg-[#075e54] text-white flex items-center justify-between px-4 shadow-lg z-30 shrink-0">
        <div className="flex items-center gap-3">
          <ArrowLeft className="w-6 h-6 cursor-pointer hover:opacity-70" />
          <div className="flex items-center text-right gap-3" dir="rtl">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-orange-500 flex-shrink-0 relative">
              <img 
                src="https://ais-pre-jrn46qsxq3dhyfomad2wb4-219901023280.europe-west2.run.app/fouad_al_farwi.png" 
                alt="F" 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Fouad"; }}
              />
              {isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#075e54]"></div>}
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-[15px] truncate max-w-[130px]">فؤاد الفروي الملك</h2>
              <span className={`text-[9px] ${isTyping ? 'font-bold text-green-300' : 'opacity-70'}`}>
                {isTyping ? 'يجري الكتابة...' : (isOnline ? 'متصل الآن' : `آخر ظهور ${lastSeen}`)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Video className="w-5 h-5 opacity-80 cursor-pointer" />
          <Phone className="w-5 h-5 opacity-80 cursor-pointer" />
          <MoreVertical className="w-5 h-5 opacity-80 cursor-pointer" />
        </div>
      </header>

      {/* Message List */}
      <main 
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 relative"
        style={{ 
          backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
          backgroundSize: '400px'
        }}
      >
        <div className="flex justify-center mb-6">
          <span className="bg-white/40 backdrop-blur-sm text-[9px] px-2 py-0.5 rounded shadow-sm text-gray-600 font-bold uppercase tracking-tighter">اليوم</span>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-2 rounded-xl shadow-sm relative min-w-[70px]
                  ${message.sender === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}
              >
                <p className="text-[14px] text-gray-800 text-right leading-tight pr-1" dir="rtl">
                  {message.text}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1" dir="ltr">
                  <span className="text-[8px] text-gray-400 font-medium lowercase">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.sender === 'user' && (
                    <CheckCheck className={`w-3 h-3 ${message.status === 'read' ? 'text-blue-500' : 'text-gray-400'}`} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-2.5 rounded-xl shadow-sm rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Control Footer */}
      <footer className="p-2 bg-[#f0f2f5] flex items-center gap-2 fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200">
        <div className="flex bg-white rounded-full flex-1 items-center px-4 py-2 shadow-sm gap-3">
          <Smile className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-500" />
          <input 
            type="text" 
            placeholder="مراسلة"
            className="flex-1 text-base outline-none text-right bg-transparent placeholder:text-gray-400 font-sans"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            dir="rtl"
          />
          <Paperclip className="w-6 h-6 text-gray-400 cursor-pointer -rotate-45 hover:text-gray-500" />
          {!inputValue && <Camera className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-500" />}
        </div>
        
        <button 
          onClick={handleSendMessage}
          className="p-3 bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-xl hover:bg-[#008f72] active:scale-95 transition-all"
        >
          {inputValue ? <Send className="w-5 h-5 ml-0.5" /> : <Mic className="w-5 h-5" />}
        </button>
      </footer>

      <style>{`
        * { direction: ltr; }
        [dir="rtl"] { direction: rtl; }
        ::-webkit-scrollbar { width: 0; background: transparent; }
      `}</style>
    </div>
  );
}
