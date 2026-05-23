import { useEffect, useRef } from 'react';
import { ICameraVideoTrack } from 'agora-rtc-sdk-ng';

interface LocalVideoOverlayProps {
  videoTrack: ICameraVideoTrack | null;
  isCameraOff: boolean;
}

const LocalVideoOverlay = ({
  videoTrack,
  isCameraOff,
}: LocalVideoOverlayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoTrack && containerRef.current && !isCameraOff) {
      videoTrack.play(containerRef.current);
    }
    return () => {
      videoTrack?.stop();
    };
  }, [videoTrack, isCameraOff]);

  return (
    <div className="fixed top-24 right-4 w-32 h-48 md:w-48 md:h-72 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-40 transition-all duration-300 group">
      <div ref={containerRef} className="w-full h-full object-cover" />
      {(isCameraOff || !videoTrack) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-500">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-[8px] uppercase tracking-widest font-black">Cam Off</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white font-bold border border-white/10">
        You
      </div>
    </div>
  );
};

export default LocalVideoOverlay;
