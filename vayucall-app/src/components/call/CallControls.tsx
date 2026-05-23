
interface CallControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onLeave: () => void;
}

const CallControls = ({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onLeave,
}: CallControlsProps) => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-6 bg-black/40 backdrop-blur-2xl px-8 py-5 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
      <button
        onClick={onToggleMute}
        className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 ${
          isMuted 
            ? 'bg-red-500/20 text-red-500 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      <button
        onClick={onLeave}
        className="w-16 h-16 flex items-center justify-center rounded-[2rem] bg-red-600 text-white hover:bg-red-700 transition-all duration-300 shadow-[0_0_30px_rgba(220,38,38,0.5)] transform hover:scale-105 active:scale-95"
        title="End Call"
      >
        <svg className="w-8 h-8 rotate-[135deg]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 2V3z" />
        </svg>
      </button>

      <button
        onClick={onToggleCamera}
        className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 ${
          isCameraOff 
            ? 'bg-red-500/20 text-red-500 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
        }`}
        title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
      >
        {isCameraOff ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default CallControls;
