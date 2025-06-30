import React, { useRef, useState } from 'react';
import { AvatarModal } from './AvatarModal';
import { Avatar } from './Avatar';

/* Mapa rápido de ID → nombre “humano” (mismo que en AvatarModal) */
const AVATAR_NAMES: Record<number, string> = {
    1: 'Príncipe', 2: 'Golondrina', 3: 'Costurera',
    4: 'Hijo costurera', 5: 'Dramaturgo', 6: 'Vendedora de cerillas',
    7: 'Alcalde', 8: 'Concejal', 9: 'Fundidor',
    10: 'Ángel', 11: 'Dios', 12: 'Niños pobres',
    13: 'Estatua', 14: 'Oscar Wilde'
};

/* Si cada avatar tuviera su propio audio, mapéalo aquí; de lo contrario, todos usan test.ogg */
const AUDIO_BY_ID: Record<number, string> = Object.fromEntries(
    Array.from({ length: 14 }, (_, i) => [i + 1, '/test.ogg'])
);

export const AvatarSelector: React.FC = () => {
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    /* ----------- Reproducir avatar seleccionado ----------- */
    const playAvatar = (id: number) => {
        /* Detiene audio anterior */
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        const src = AUDIO_BY_ID[id] ?? '/test.ogg';
        const audio = new Audio(src);
        audioRef.current = audio;

        setCurrentId(id);
        setModalOpen(true);
        setIsPlaying(true);

        audio.play();
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Selecciona un avatar y prueba el audio</h2>

            {/* Grid de miniaturas */}
            <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 14 }, (_, i) => i + 1).map(id => (
                    <button
                        key={id}
                        onClick={() => playAvatar(id)}
                        className={`flex flex-col items-center justify-center border rounded-lg overflow-hidden relative hover:ring-2 hover:ring-emerald-500
                        ${currentId === id ? 'ring-2 ring-emerald-600' : ''}`}
                        style={{
                            width: 120,         // botón más grande
                            height: 140,        // extra altura para el texto
                            padding: 8,
                            gap: 4,
                            backgroundColor: '#f9fafb'
                        }}
                    >
                        <Avatar avatarId={id} isPlaying={false} size={100} /> {/* ajustado */}
                        <span style={{
                            fontSize: '0.75rem',   // ≈ text-xs
                            color: '#374151',      // ≈ text-gray-700
                            textAlign: 'center',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {AVATAR_NAMES[id]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Modal de reproducción */}
            {currentId !== null && (
                <AvatarModal
                    isOpen={modalOpen}
                    onClose={() => { setModalOpen(false); setIsPlaying(false); }}
                    isPlaying={isPlaying}
                    avatarId={currentId}
                />
            )}
        </div>
    );
};
