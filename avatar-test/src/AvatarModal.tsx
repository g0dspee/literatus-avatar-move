import React, { useRef, useState } from 'react';
import { X, Minus } from 'lucide-react';
import { Avatar } from './Avatar';

/*️⃣  Mapa para mostrar un título legible en la barra del modal */
const AVATAR_NAMES: Record<number, string> = {
  1: 'Príncipe',
  2: 'Golondrina',
  3: 'Costurera',
  4: 'Hijo costurera',
  5: 'Dramaturgo',
  6: 'Vendedora de cerillas',
  7: 'Alcalde',
  8: 'Concejal',
  9: 'Fundidor',
  10: 'Ángel',
  11: 'Dios',
  12: 'Niños pobres',
  13: 'Estatua',
  14: 'Oscar Wilde'
};

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  avatarId: number;          // ahora ID numérico (1–14)
  size?: number;          // opcional: px; por defecto 400
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  isPlaying,
  avatarId,
  size = 400
}) => {
  /* estado para mover / redimensionar ventana */
  const [boxSize, setBoxSize] = useState({ width: size, height: size });
  const [position, setPosition] = useState({ x: window.innerWidth - size - 50, y: 50 });
  const [isMinimized, setMin] = useState(false);

  /* refs para drag / resize */
  const isResizing = useRef(false);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const startDragPos = useRef({ x: 0, y: 0 });

  /* ─────────── Handlers ─────────── */

  const handleResizeStart = (e: React.MouseEvent) => {
    isResizing.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { ...boxSize };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement) return; // evita arrastrar al hacer click en botones

    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startDragPos.current = { ...position };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current) {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;

      setBoxSize({
        width: Math.max(200, startSize.current.width + dx),
        height: Math.max(200, startSize.current.height + dy)
      });
    } else if (isDragging.current) {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;

      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - boxSize.width, startDragPos.current.x + dx)),
        y: Math.max(0, Math.min(window.innerHeight - boxSize.height, startDragPos.current.y + dy))
      });
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  /* ─────────── Render ─────────── */

  if (!isOpen) return null;

  const title = AVATAR_NAMES[avatarId] ?? `Avatar ${avatarId}`;

  return (
    <div
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        width: boxSize.width,
        height: isMinimized ? 'auto' : boxSize.height,
        zIndex: 50
      }}
      className="flex flex-col rounded-lg bg-white shadow-2xl"
    >
      {/* Barra superior (drag) */}
      <div
        className="flex items-center justify-between rounded-t-lg bg-gray-100 px-4 py-2 cursor-move select-none"
        onMouseDown={handleDragStart}
      >
        <span className="font-medium text-gray-700">{title}</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMin(!isMinimized)}
            className="rounded-full p-1 hover:bg-gray-200"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Contenido (avatar) */}
      {!isMinimized && (
        <div className="relative flex-1">
          <div className="h-full w-full p-4">
            <Avatar avatarId={avatarId} isPlaying={isPlaying} size={boxSize.width - 32} />
          </div>

          {/* Esquina de redimensionado */}
          <div
            className="absolute bottom-0 right-0 h-6 w-6 cursor-se-resize"
            onMouseDown={handleResizeStart}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-gray-400">
              <path fill="currentColor"
                d="M22 22H20V20H22V22ZM22 18H18V20H22V18ZM18 22H16V24H18V22ZM14 22H12V24H14V22ZM22 14H20V16H22V14Z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
