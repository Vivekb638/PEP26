import React from 'react';
import { Send, Sparkles, FileText, RefreshCw, Trash2, CheckCircle } from 'lucide-react';

export function AIChat({
  chatHistory,
  chatLoading,
  chatQuestion,
  onQuestionChange,
  onQuestionSubmit,
  onIndexSyllabus,
  indexingLoading,
  indexingMessage,
  onClearChat,
  chatEndRef
}) {
  const suggestedQuestions = [
    "Explain REST APIs",
    "What is Cosine Similarity?",
    "Explain Mongoose Schemas",
    "How does text chunking work?"
  ];

  const handleSuggestedClick = (q) => {
    onQuestionChange({ target: { value: q } });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d1324]/40 border border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-black/25 relative">
      
      {/* AI Tutor Chat Header */}
      <div className="bg-[#101628] px-5 py-4 border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-purple-500/10 border border-purple-500/30 p-2 rounded-xl text-purple-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-200">StudyStack AI Tutor</h3>
            <p className="text-[10px] text-gray-500 font-medium">Retrieval-Augmented Syllabus Co-pilot</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Indexing Button */}
          <button
            onClick={onIndexSyllabus}
            disabled={indexingLoading}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-purple-650 hover:bg-purple-500 text-white px-3 py-2 rounded-xl transition-all border border-purple-550/20 active:scale-[0.98]"
            title="Index Syllabus PDF Context"
          >
            {indexingLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                Index PDF
              </>
            )}
          </button>
          
          {/* Clear Chat */}
          <button
            onClick={onClearChat}
            className="p-2 text-gray-400 hover:text-red-400 rounded-xl hover:bg-red-950/20 border border-transparent hover:border-red-500/10 transition-colors"
            title="Clear Chat Logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Index Messages Banner */}
      {indexingMessage && (
        <div className="bg-purple-950/20 border-b border-purple-500/20 text-purple-300 px-5 py-2.5 text-[10.5px] flex items-center justify-between animate-fadeIn select-none shrink-0">
          <span className="truncate flex items-center gap-1.5 font-medium">
            <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
            {indexingMessage}
          </span>
        </div>
      )}

      {/* Message History Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[50vh] md:max-h-none min-h-[250px]">
        {chatHistory.map((msg, index) => (
          <div 
            key={index}
            className={`flex flex-col max-w-[82%] animate-fadeIn ${
              msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            {/* Bubble */}
            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-blue-650 text-white rounded-br-none shadow-md shadow-blue-500/5'
                : 'bg-[#141b30] border border-slate-800 text-gray-200 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>

            {/* Sources dropdown */}
            {msg.sender === 'bot' && msg.sources && msg.sources.length > 0 && (
              <div className="w-full mt-2 space-y-1 animate-slideDown">
                <span className="text-[9px] font-bold text-gray-500 tracking-wider uppercase block">Retrieved Context:</span>
                <div className="grid grid-cols-1 gap-1">
                  {msg.sources.map((src, sIdx) => (
                    <div 
                      key={sIdx}
                      className="bg-[#0f1526]/80 border border-slate-850 rounded px-2.5 py-1 text-[9.5px] text-purple-300 font-mono truncate"
                      title={src}
                    >
                      "{src}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {chatLoading && (
          <div className="mr-auto items-start max-w-[82%] flex flex-col animate-pulse">
            <div className="bg-[#141b30] border border-slate-800 text-gray-400 p-3.5 rounded-2xl rounded-bl-none text-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span>Querying vector store...</span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Questions Grid */}
      <div className="px-5 py-2.5 border-t border-slate-850 bg-[#0e1426]/30 shrink-0">
        <span className="text-[9px] font-bold text-gray-500 tracking-wider uppercase block mb-1.5">Suggested Questions:</span>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedClick(q)}
              className="text-[10px] font-semibold text-slate-350 bg-[#12182c]/80 border border-slate-800 hover:border-purple-500/30 hover:text-purple-400 px-3 py-1.5 rounded-lg transition-all active:scale-[0.98]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message Submission Form */}
      <form onSubmit={onQuestionSubmit} className="p-4 border-t border-slate-800 bg-[#0c1224] shrink-0">
        <div className="flex gap-2">
          <input
            required
            type="text"
            value={chatQuestion}
            onChange={onQuestionChange}
            placeholder="Ask AI Tutor a question about the syllabus..."
            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-gray-200 focus:outline-none focus:border-purple-500 placeholder-slate-600 transition-colors"
          />
          <button
            type="submit"
            disabled={chatLoading}
            className="bg-purple-650 hover:bg-purple-500 text-white p-3 rounded-xl transition-all shadow-md shadow-purple-650/15 border border-purple-550/20 active:scale-95 shrink-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

    </div>
  );
}
