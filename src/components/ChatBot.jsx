import { useState, useRef, useEffect } from 'react';

const SYSTEM_PROMPT = `You are ClaimReady Assistant, an expert on Singapore insurance claims. 
You help Singaporeans understand their insurance policies and how to file claims correctly.
Keep answers short, clear, and specific to Singapore (MediShield Life, Integrated Shield Plans, 
NTUC Income, AIA, Prudential, Great Eastern, FIDReC, etc).
Use simple English. Maximum 4 sentences per reply. 
If asked about a specific policy, remind them they can upload it in Claim Coach for a full analysis.`;

async function callAgnesChatbot(userMessage) {
  const apiKey = import.meta.env.VITE_AGNES_API_KEY;
  const response = await fetch('/api/agnes/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'agnes-2.0-flash',
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
    }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Sorry, no response received.';
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (messages.length === 0) {
        setMessages([{
          role: 'assistant',
          content: "Hi! 👋 I'm your ClaimReady Assistant. I can help you with:\n• Understanding your insurance policy\n• How to file a claim\n• What documents you need\n• Why claims get rejected\n• MediShield, ISP, travel insurance questions\n\nAsk me anything!"
        }]);
      }
    }
  };

  const handleClose = () => setIsOpen(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);
    try {
      const reply = await callAgnesChatbot(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I couldn't get a response. Please try again. (${error.message})`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'How to file a claim?',
    'What is FIDReC?',
    'What is MediShield Life?',
    'Why was my claim rejected?',
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-24 right-4 z-40 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl transition-all duration-200 hover:scale-105"
        aria-label="Open chat"
      >
        💬
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-end justify-center sm:justify-end bg-black/30"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:w-[380px] sm:h-[560px] h-[80vh] flex flex-col overflow-hidden sm:mr-4 sm:mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white p-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base">ClaimReady Assistant</h3>
                <p className="text-xs opacity-90">Ask me anything about insurance claims in Singapore</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">Agnes AI</span>
                <button
                  onClick={handleClose}
                  className="text-white hover:text-gray-200 text-xl ml-2"
                  aria-label="Close chat"
                >✕</button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-2 text-sm whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-[#1B2B5E] text-white rounded-br-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-xl rounded-bl-sm px-4 py-3 text-sm shadow-sm border border-gray-100">
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce text-[#7C3AED]">●</span>
                      <span className="animate-bounce text-[#7C3AED]" style={{ animationDelay: '0.15s' }}>●</span>
                      <span className="animate-bounce text-[#7C3AED]" style={{ animationDelay: '0.3s' }}>●</span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 bg-gray-50 shrink-0">
                <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-1">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(q);
                      }}
                      className="text-xs bg-white border border-[#7C3AED] text-[#7C3AED] rounded-full px-3 py-1 hover:bg-[#7C3AED] hover:text-white transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 p-3 bg-white shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question..."
                  disabled={isLoading}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Powered by Agnes AI</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}