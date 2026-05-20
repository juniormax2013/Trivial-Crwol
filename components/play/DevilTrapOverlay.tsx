'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface TransparentImageProps {
  src: string;
  alt: string;
  className?: string;
}

function TransparentImage({ src, alt, className }: TransparentImageProps) {
  const [processedSrc, setProcessedSrc] = useState<string>('');

  useEffect(() => {
    let active = true;
    const img = new window.Image();
    
    // No establecemos crossOrigin a menos que sea una URL externa para evitar tainted canvas local.
    if (src.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    
    const processImage = () => {
      if (!active) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = canvas.width;
        const height = canvas.height;

        const visited = new Uint8Array(width * height);
        const queue: { x: number; y: number }[] = [];

        const getIdx = (x: number, y: number) => (y * width + x) * 4;
        const getVisIdx = (x: number, y: number) => y * width + x;

        // Ampliamos el umbral para abarcar más tonalidades de blanco, grises de compresión y cuadrícula
        const isBgColor = (x: number, y: number) => {
          const idx = getIdx(x, y);
          const r = data[idx + 0];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a === 0) return false;

          // Blanco o color muy claro con tonalidades similares
          if (r > 200 && g > 200 && b > 200) {
            return true;
          }
          
          // Grises y cuadrículas de fondo
          if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r > 165) {
            return true;
          }

          return false;
        };

        const addSeed = (x: number, y: number) => {
          const vIdx = getVisIdx(x, y);
          if (!visited[vIdx] && isBgColor(x, y)) {
            visited[vIdx] = 1;
            queue.push({ x, y });
          }
        };

        // Rellenar desde todos los bordes
        for (let x = 0; x < width; x++) {
          addSeed(x, 0);
          addSeed(x, height - 1);
        }
        for (let y = 0; y < height; y++) {
          addSeed(0, y);
          addSeed(width - 1, y);
        }

        const dx = [1, -1, 0, 0, 1, 1, -1, -1];
        const dy = [0, 0, 1, -1, 1, -1, 1, -1];

        while (queue.length > 0) {
          const curr = queue.shift();
          if (!curr) continue;
          const { x, y } = curr;
          const idx = getIdx(x, y);
          data[idx + 3] = 0; // Transparencia total

          for (let i = 0; i < 8; i++) {
            const nx = x + dx[i];
            const ny = y + dy[i];
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const vIdx = getVisIdx(nx, ny);
              if (!visited[vIdx] && isBgColor(nx, ny)) {
                visited[vIdx] = 1;
                queue.push({ x: nx, y: ny });
              }
            }
          }
        }

        // Suavizado fino de los bordes externos
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = getIdx(x, y);
            if (data[idx + 3] > 0) {
              const r = data[idx + 0];
              const g = data[idx + 1];
              const b = data[idx + 2];

              // Si es un pixel muy claro adyacente a la transparencia, lo removemos
              if (r > 210 && g > 210 && b > 210) {
                let hasTransNeighbor = false;
                for (let i = 0; i < 4; i++) {
                  const nx = x + dx[i];
                  const ny = y + dy[i];
                  if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nidx = getIdx(nx, ny);
                    if (data[nidx + 3] === 0) {
                      hasTransNeighbor = true;
                      break;
                    }
                  }
                }
                if (hasTransNeighbor) {
                  data[idx + 3] = 0;
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setProcessedSrc(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Error procesando transparencia en cliente, fallback a src original:', err);
        // Fallback: mostrar la imagen original si algo falla
        setProcessedSrc(src);
      }
    };

    img.onload = processImage;
    img.src = src;

    // Si ya está en caché y cargada completamente, procesar inmediatamente
    if (img.complete) {
      processImage();
    }

    return () => {
      active = false;
    };
  }, [src]);

  if (!processedSrc) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={processedSrc} alt={alt} className={className} />;
}

interface DevilTrapOverlayProps {
  isActive: boolean;
}

export default function DevilTrapOverlay({ isActive }: DevilTrapOverlayProps) {
  const [particles, setParticles] = useState<{ id: number; left: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Generate random particles for floating embers
    const list = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 6 + 3,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 4,
    }));
    setParticles(list);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* 1. Inject custom animations to avoid compilation or package configuration issues */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes devil-float-up {
          0% {
            transform: translateY(100%) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-110vh) scale(0.4);
            opacity: 0;
          }
        }
        @keyframes devil-wobble-float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-8px) rotate(-2deg);
          }
          50% {
            transform: translateY(-15px) rotate(1deg);
          }
          75% {
            transform: translateY(-7px) rotate(-1deg);
          }
        }
        @keyframes devil-slide-in-right {
          0% {
            transform: translateX(180px) rotate(20deg);
            opacity: 0;
          }
          100% {
            transform: translateX(0px) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes screen-shake-brief {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-2px, -2px) rotate(-0.5deg); }
          20% { transform: translate(2px, 1px) rotate(0.5deg); }
          30% { transform: translate(-1px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(0.5deg); }
          50% { transform: translate(-2px, 1px) rotate(-0.5deg); }
          60% { transform: translate(2px, 2px) rotate(0deg); }
          70% { transform: translate(-1px, -1px) rotate(0.5deg); }
          80% { transform: translate(1px, 1px) rotate(-0.5deg); }
          90% { transform: translate(-2px, -2px) rotate(0deg); }
        }
      ` }} />

      {/* 2. Brief screen shake trigger on mount */}
      <div className="fixed inset-0 pointer-events-none z-[49] animate-[screen-shake-brief_0.6s_ease-out_forwards]" />

      {/* 3. Dark, fiery ambient background overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-1000 bg-gradient-to-t from-red-950/70 via-black/85 to-transparent backdrop-brightness-[0.75] backdrop-contrast-[1.15]" 
        style={{ contentVisibility: 'auto' }}
      />

      {/* 4. Embers Particle System */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-0 rounded-full bg-gradient-to-t from-orange-500 to-red-500 opacity-60 blur-[0.5px]"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              animation: `devil-float-up ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 5. The Animated Devil Character on the Right */}
      <div className="fixed right-2 bottom-20 md:right-10 md:bottom-28 z-[48] pointer-events-none animate-[devil-slide-in-right_1s_ease-out_forwards]">
        <div className="flex flex-col items-center select-none">
          {/* Devil Aura Glow */}
          <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-30 animate-pulse" />
          
          {/* Character Container with float */}
          <div className="relative w-28 h-28 md:w-36 md:h-36 overflow-visible flex items-center justify-center animate-[devil-wobble-float_4s_ease-in-out_infinite]">
            <TransparentImage 
              src="/images/devil_avatar.png" 
              alt="Devil Trap Character" 
              className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" 
            />
          </div>
          
          {/* Bubble dialog */}
          <div className="mt-1 bg-red-950/95 text-red-200 border border-red-500/30 text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm animate-bounce">
            ¡Muajaja! 😈
          </div>
        </div>
      </div>
    </>
  );
}
