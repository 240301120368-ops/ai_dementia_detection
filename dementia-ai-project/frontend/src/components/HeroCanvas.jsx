import React, { useEffect, useRef, useState } from 'react';
import { useScroll, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';

const HeroCanvas = () => {
  const canvasRef = useRef(null);
  const totalFrames = 201; // ezgif-frame-001 to 201
  const [images, setImages] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // We scrub based on global scroll. 
  // Scrubbing for the first 800px of scroll to cover the heroic section
  const { scrollY } = useScroll();
  const rawFrame = useTransform(scrollY, [0, 800], [1, totalFrames]);
  const springFrame = useSpring(rawFrame, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    let loadedCount = 0;
    const loadedImages = [];
    for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const num = i.toString().padStart(3, '0'); // format: 001
        img.src = `/cell-explosion-hero-page/ezgif-frame-${num}.jpg`;
        img.onload = () => {
          loadedImages[i] = img;
          loadedCount++;
          if (loadedCount === totalFrames) {
            setImages(loadedImages);
            setLoaded(true);
            
            // Draw the first frame immediately once loaded
            drawFrame(1, loadedImages);
          }
        };
    }
  }, []);

  const drawFrame = (frameIndex, optionalImages = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const frameNumber = Math.max(1, Math.min(totalFrames, Math.round(frameIndex)));

    const imageArray = optionalImages || images;
    const img = imageArray[frameNumber];
    if (img) {
      canvas.width = img.width;
      canvas.height = img.height;
      
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      
      ctx.fillStyle = "#0a0a0a"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }
  };

  useMotionValueEvent(springFrame, "change", (latestFrame) => {
    if (loaded) drawFrame(latestFrame);
  });

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <canvas ref={canvasRef} className="w-full h-full object-cover opacity-60 mix-blend-screen"></canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-transparent"></div>
    </div>
  );
}

export default HeroCanvas;
