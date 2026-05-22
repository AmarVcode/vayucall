import React, { useEffect, useRef } from 'react';
import { ICameraVideoTrack } from 'agora-rtc-sdk-ng';

interface LocalVideoOverlayProps {
  videoTrack: ICameraVideoTrack | null;
  isCameraOff: boolean;
}

const LocalVideoOverlay: React.FC<LocalVideoOverlayProps> = ({
  videoTrack,
  isCameraOff,
}) => {
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
    <div className="fixed bottom-24 right-4 w-40 h-30 md:w-50 md:h-38 bg-gray-800 rounded-xl overflow-hidden border-2 border-cyan shadow-2xl z-40">
      <div ref={containerRef} className="w-full h-full" />
      {(isCameraOff || !videoTrack) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-500">
          <p className="text-[10px] uppercase tracking-wider font-bold">Camera Off</p>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white">
        You
      </div>
    </div>
  );
};

export default LocalVideoOverlay;
