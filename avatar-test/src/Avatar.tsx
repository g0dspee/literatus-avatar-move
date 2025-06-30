import React, { useEffect, useState } from 'react';

/** Cada ID numérico mapea a carpeta + rango de frames */
const AVATARS: Record<number, { folder: string; start: number; end: number }> = {
  1: { folder: '01principe', start: 1, end: 17 },
  2: { folder: '02golondrina', start: 18, end: 38 },
  3: { folder: '03costurera', start: 39, end: 57 },
  4: { folder: '04hijocosturera', start: 58, end: 75 },
  5: { folder: '05dramaturgo', start: 76, end: 93 },
  6: { folder: '06vendedoracerillas', start: 94, end: 110 },
  7: { folder: '07alcalde', start: 111, end: 129 },
  8: { folder: '08concejal', start: 130, end: 147 },
  9: { folder: '09fundidor', start: 148, end: 166 },
  10: { folder: '10angel', start: 167, end: 183 },
  11: { folder: '11dios', start: 184, end: 200 },
  12: { folder: '12ninospobres', start: 201, end: 218 },
  13: { folder: '13estatua', start: 219, end: 237 },
  14: { folder: '14oscarwilde', start: 238, end: 258 }
};

interface AvatarProps {
  avatarId: number;      // 1‥14
  isPlaying: boolean;
  size?: number;         // px
  fps?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  avatarId,
  isPlaying,
  size = 400,
  fps = 13
}) => {
  const avatar = AVATARS[avatarId];

  // Fallback seguro si el ID es incorrecto
  if (!avatar) {
    console.warn(`Avatar ID ${avatarId} no está definido`);
    return (
      <div style={{ width: size, height: size }} className="flex items-center justify-center bg-gray-200 rounded-lg">
        <span className="text-sm text-gray-600">Avatar {avatarId} no encontrado</span>
      </div>
    );
  }

  const { folder, start, end } = avatar;
  const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const pingpong = indices.concat(indices.slice(1, -1).reverse());

  const [frame, setFrame] = useState(0);
  const frameTime = 1000 / fps;

  useEffect(() => {
    let raf: number, last = 0;

    const step = (now: number) => {
      if (isPlaying) {
        if (now - last >= frameTime) {
          setFrame(f => (f + 1) % pingpong.length);
          last = now;
        }
        raf = requestAnimationFrame(step);
      }
    };

    if (isPlaying) raf = requestAnimationFrame(step);
    else setFrame(0);

    return () => cancelAnimationFrame(raf);
  }, [isPlaying, pingpong.length, frameTime]);

  const src = `/avatar-frames/${folder}/frame${String(pingpong[frame]).padStart(5, '0')}.png`;

  return (
    <div
      style={{
        width: size ?? 120,          // 120 px por defecto si no llega prop
        height: size ?? 120,
        position: 'relative',
        overflow: 'hidden',           // ← recorta lo que sobresale
        borderRadius: '0.5rem'        // ← equivale a rounded-lg
      }}
    >
      <img
        src={src}
        alt={`Avatar ${avatarId}`}
        style={{
          width: '100%',             // ← llena contenedor
          height: '100%',
          objectFit: 'cover',         // ← mantiene proporción y recorta laterales
          objectPosition: 'center',   // ← centra la parte útil
          display: 'block'            // ← evita espacios fantasma
        }}
      />

      {isPlaying && (
        <div style={{ position: 'absolute', inset: '-4px', zIndex: -1 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right,#d1fae5,#a7f3d0)',
              opacity: 0.4,
              filter: 'blur(4px)',
              animation: 'pulse 2s infinite'
            }}
          />
        </div>
      )}
    </div>

  );
};
