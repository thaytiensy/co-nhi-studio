"use client";

import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessageItem from './ChatMessageItem';
import ChatInputBar from './ChatInputBar';
import { requestGroqChat } from '../../utils/groqChatService';
import { getNaturalPedagogyResponse } from '../../utils/naturalPedagogyChatService';
import { speechService } from '../../utils/speechService';

const WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'assistant',
  time: 'Vừa xong',
  title: 'Chào Thầy/Cô Mĩ Thuật! 🎨',
  content: 'Dạ em chào Thầy/Cô ạ! Em là Cô Trợ Giảng AI của Cọ Nhí Studio, bám sát SGK Mĩ thuật Kết nối tri thức với cuộc sống (Lớp 1 - 5) & Thông tư 27.\n\nThầy/Cô cứ nhắn tin trò chuyện tự nhiên như với người thật nhé. Em sẵn sàng cùng Thầy/Cô lên ý tưởng trò chơi khởi động, soạn câu hỏi gợi mở, hay tư vấn mẹo xử lý khi các bé sợ vẽ sai, vẽ chậm ạ! ❤️',
};

export default function OfflinePedagogyAssistant({
  currentSlide = null,
  currentGrade = 1,
  onInsertToNotes,
  onClose,
  isMaximized = false,
  onToggleMaximize,
}) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [isAutoSpeak, setIsAutoSpeak] = useState(false);
  const [aiProvider, setAiProvider] = useState('online');
  const [currentGender, setCurrentGender] = useState(() => speechService.gender || 'female');

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    const unsub = speechService.subscribe((state) => setCurrentGender(state.gender));
    return () => { unsub(); speechService.stop(); };
  }, []);

  // Tự động cuộn xuống khi có thông tin hoặc tin nhắn mới xuất hiện
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isLoading]);

  const handleGenderChange = (gender) => {
    speechService.setGender(gender);
    setCurrentGender(gender);
  };

  const handleResetChat = () => {
    speechService.stop();
    setMessages([{ ...WELCOME_MESSAGE, id: Date.now().toString(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const handleReadCurrentSlide = () => {
    if (!currentSlide) return speechService.speak('Hiện chưa chọn trang slide nào Thầy/Cô nhé.');
    const parts = [];
    if (currentSlide.title && !currentSlide.title.startsWith('Trang ')) parts.push(currentSlide.title.trim());
    (currentSlide.elements || []).forEach(e => {
      if ((e.type === 'text' || e.type === 'shape') && e.text?.trim()) parts.push(e.text.trim());
    });
    const textToRead = parts.join('. ') || currentSlide.notes || 'Trang slide này hiện chưa có nội dung văn bản giáo khoa ạ.';
    speechService.speak(textToRead);
  };

  const handleSendMessage = async (queryText) => {
    const text = (queryText || userQuery || '').trim();
    if (!text || isLoading) return;
    setUserQuery('');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: `${Date.now()}-user`, sender: 'user', time, content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const assistantMsgId = `${Date.now()}-assistant`;
    let responseText = '';

    if (aiProvider === 'online') {
      try {
        const history = [...messages, userMsg].filter(m => ['user', 'assistant'].includes(m.sender) && typeof m.content === 'string').slice(-8).map(m => ({ role: m.sender, content: m.content }));
        responseText = await requestGroqChat({
          grade: currentGrade,
          theme: currentSlide?.title || '',
          persona: currentGender === 'female' ? 'Cô giáo mĩ thuật Hoài My' : 'Thầy giáo mĩ thuật Nam Minh',
          messages: history,
        }, globalThis.fetch, (delta) => {
          setMessages(prev => {
            const exists = prev.some(m => m.id === assistantMsgId);
            if (!exists) return [...prev, { id: assistantMsgId, sender: 'assistant', time, content: delta, provider: 'Groq Free ⚡', isStreaming: true }];
            return prev.map(m => m.id === assistantMsgId ? { ...m, content: m.content + delta } : m);
          });
          scrollToBottom('auto');
        });
      } catch (_) {
        responseText = getNaturalPedagogyResponse(text, currentGrade, currentSlide?.title || '');
      }
    } else {
      await new Promise(r => setTimeout(r, 150));
      responseText = getNaturalPedagogyResponse(text, currentGrade, currentSlide?.title || '');
    }

    setMessages(prev => {
      const exists = prev.some(m => m.id === assistantMsgId);
      const prov = aiProvider === 'online' ? 'Groq Free ⚡' : 'Cục Bộ Offline 📦';
      if (!exists) return [...prev, { id: assistantMsgId, sender: 'assistant', time, content: responseText, provider: prov, isStreaming: false }];
      return prev.map(m => m.id === assistantMsgId ? { ...m, content: responseText, provider: prov, isStreaming: false } : m);
    });

    setIsLoading(false);
    if (isAutoSpeak && responseText) speechService.speak(responseText);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 select-none overflow-hidden">
      <ChatHeader
        currentGender={currentGender}
        onGenderChange={handleGenderChange}
        isAutoSpeak={isAutoSpeak}
        onToggleAutoSpeak={() => setIsAutoSpeak(prev => !prev)}
        isMaximized={isMaximized}
        onToggleMaximize={onToggleMaximize}
        onResetChat={handleResetChat}
        onReadCurrentSlide={handleReadCurrentSlide}
        onClose={onClose}
        aiProvider={aiProvider}
        onProviderChange={setAiProvider}
      />

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3.5 space-y-1 scroll-smooth bg-gradient-to-b from-slate-100 to-amber-50/20">
        {messages.map(msg => (
          <ChatMessageItem key={msg.id} message={msg} onInsertToNotes={onInsertToNotes} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 mb-3.5 animate-in fade-in">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400 shrink-0 bg-slate-900">
              <img src="/images/tro-giang-ai.jpg" alt="Cô Trợ Giảng" className="w-full h-full object-cover" />
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-2xs flex items-center gap-2 text-xs font-bold text-amber-800">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
              </div>
              <span className="text-[11px] text-slate-500">Cô Trợ Giảng đang suy nghĩ và gõ chữ...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-1 shrink-0" />
      </div>

      <ChatInputBar
        userQuery={userQuery}
        onQueryChange={setUserQuery}
        onSubmit={(e) => { e?.preventDefault(); handleSendMessage(userQuery); }}
        isLoading={isLoading}
        onSelectSuggestion={(prompt) => handleSendMessage(prompt)}
      />
    </div>
  );
}
