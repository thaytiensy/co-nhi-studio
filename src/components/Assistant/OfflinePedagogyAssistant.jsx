"use client";

import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessageItem from './ChatMessageItem';
import ChatInputBar from './ChatInputBar';
import RobotTeacherStage from './RobotTeacherStage';
import { getNaturalPedagogyResponse, getSpokenDialogueResponse } from '../../utils/naturalPedagogyChatService';
import { speechService } from '../../utils/speechService';

const WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'assistant',
  time: 'Vừa xong',
  title: 'Chào Thầy/Cô Mĩ Thuật! 🎨',
  content: 'Dạ em chào Thầy/Cô ạ! Em là Cô Trợ Giảng AI của Cọ Nhí Studio, bám sát SGK Mĩ thuật Kết nối tri thức với cuộc sống (Lớp 1 - 5) & Thông tư 27.\n\nThầy/Cô cứ nhắn tin hoặc nói chuyện tự nhiên như với người thật nhé. Em sẵn sàng đàm thoại giọng nói tức thì với Thầy/Cô ạ! ❤️',
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
  const [isAutoSpeak, setIsAutoSpeak] = useState(true);
  const [aiProvider, setAiProvider] = useState('offline');
  const [currentGender, setCurrentGender] = useState(() => speechService.gender || 'female');
  const [viewMode, setViewMode] = useState('stage'); // 'stage' (default Robot Teacher) | 'chat' (Text List)
  const [isSpeaking, setIsSpeaking] = useState(() => speechService.isSpeaking);
  const [isListening, setIsListening] = useState(false);
  const [currentSpokenText, setCurrentSpokenText] = useState(
    'Dạ em chào Thầy Cô ạ! Em là Cô Trợ Giảng AI của Cọ Nhí Studio. Thầy Cô cần em hỗ trợ gì cứ nói với em nhé!'
  );

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const unsub = speechService.subscribe((state) => {
      setCurrentGender(state.gender);
      setIsSpeaking(state.isSpeaking);
    });
    return () => { unsub(); speechService.stop(); };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const handleGenderChange = (gender) => {
    speechService.setGender(gender);
    setCurrentGender(gender);
  };

  const handleResetChat = () => {
    speechService.stop();
    setMessages([{ ...WELCOME_MESSAGE, id: Date.now().toString(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setCurrentSpokenText('Dạ em chào Thầy Cô ạ! Em đã sẵn sàng đồng hành cùng Thầy Cô.');
  };

  const handleReadCurrentSlide = () => {
    if (!currentSlide) return speechService.speak('Hiện chưa chọn trang slide nào Thầy/Cô nhé.');
    const parts = [];
    if (currentSlide.title && !currentSlide.title.startsWith('Trang ')) parts.push(currentSlide.title.trim());
    (currentSlide.elements || []).forEach(e => {
      if ((e.type === 'text' || e.type === 'shape') && e.text?.trim()) parts.push(e.text.trim());
    });
    const textToRead = parts.join('. ') || currentSlide.notes || 'Trang slide này hiện chưa có nội dung văn bản giáo khoa ạ.';
    setCurrentSpokenText(textToRead);
    speechService.speak(textToRead);
  };

  const handleCharacterClick = () => {
    const roleTitle = currentGender === 'male' ? 'Thầy Trợ Giảng AI' : 'Cô Trợ Giảng AI';
    const prompt = `Dạ em chào Thầy Cô ạ! Em là ${roleTitle} của Cọ Nhí Studio. Thầy Cô cần em tư vấn mẹo xử lý học sinh sợ vẽ sai, hay trò chơi khởi động năm phút không ạ?`;
    setCurrentSpokenText(prompt);
    speechService.speak(prompt);
  };

  const handleSendMessage = async (queryText) => {
    const text = (queryText || userQuery || '').trim();
    if (!text || isLoading) return;
    setUserQuery('');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: `${Date.now()}-user`, sender: 'user', time, content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // 1. Phản hồi giọng nói tự nhiên tức thì trong 0.3s - 0.4s
    const spokenText = getSpokenDialogueResponse(text, currentGrade, currentSlide?.title || '', currentGender, currentSlide);
    setCurrentSpokenText(spokenText);
    if (isAutoSpeak) {
      speechService.speak(spokenText);
    }

    // 2. Cập nhật nội dung văn bản chuẩn sư phạm cho lịch sử
    const fullText = getNaturalPedagogyResponse(text, currentGrade, currentSlide?.title || '', currentGender, currentSlide);
    const assistantMsgId = `${Date.now()}-assistant`;
    setMessages(prev => [
      ...prev,
      { id: assistantMsgId, sender: 'assistant', time, content: fullText, provider: 'Cọ Nhí AI ⚡', isStreaming: false }
    ]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 select-none overflow-hidden">
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
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(prev => prev === 'stage' ? 'chat' : 'stage')}
      />

      {viewMode === 'stage' ? (
        <RobotTeacherStage
          isSpeaking={isSpeaking}
          isListening={isListening}
          currentSpokenText={currentSpokenText}
          onStopSpeech={() => speechService.stop()}
          onReplaySpeech={() => currentSpokenText && speechService.speak(currentSpokenText)}
          onCharacterClick={handleCharacterClick}
          onToggleViewMode={() => setViewMode('chat')}
          activeTopicLabel={currentSlide?.title || ''}
          currentGender={currentGender}
        />
      ) : (
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3.5 space-y-1 scroll-smooth bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="flex justify-end pb-2">
            <button
              type="button"
              onClick={() => setViewMode('stage')}
              className="px-2.5 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-md cursor-pointer transition-all"
            >
              🤖 {currentGender === 'male' ? 'Quay lại Thầy Giáo Robot 3D' : 'Quay lại Cô Giáo Robot 3D'}
            </button>
          </div>
          {messages.map(msg => (
            <ChatMessageItem key={msg.id} message={msg} onInsertToNotes={onInsertToNotes} />
          ))}
          <div ref={messagesEndRef} className="h-1 shrink-0" />
        </div>
      )}

      <ChatInputBar
        userQuery={userQuery}
        onQueryChange={setUserQuery}
        onSubmit={(e, transcriptText) => { e?.preventDefault?.(); handleSendMessage(transcriptText || userQuery); }}
        isLoading={isLoading}
        onSelectSuggestion={(prompt) => handleSendMessage(prompt)}
        onListeningChange={setIsListening}
      />
    </div>
  );
}