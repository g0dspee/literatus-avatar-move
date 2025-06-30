// src/components/VoiceChat.tsx
import React, { useEffect, useRef, useState } from "react";
import { AvatarModal } from "./AvatarModal";

/* Mapa avatarId → nombre legible */
const AVATAR_NAMES: Record<number, string> = {
  1: "Príncipe",
  2: "Golondrina",
  3: "Costurera",
  4: "Hijo costurera",
  5: "Dramaturgo",
  6: "Vendedora de cerillas",
  7: "Alcalde",
  8: "Concejal",
  9: "Fundidor",
  10: "Ángel",
  11: "Dios",
  12: "Niño pobre (voz 1)",
  13: "Niño pobre (voz 2)",
  14: "Oscar Wilde",
  15: "Narrador hombre",
  16: "Narradora mujer",
  17: "Estatua",
};

/* Utilidad para leer cookies */
const getCookie = (name: string): string | null =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1] ?? null;

export const VoiceChat: React.FC = () => {
  /* -------------------- estado -------------------- */
  const [prompt, setPrompt] = useState("");
  const [avatarId, setAvatarId] = useState<number>(1);
  const [isLoading, setLoading] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [response, setResponse] = useState("");
  const [modalOpen, setModalOpen] = useState(true);

  /* refs para audio */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentBlob = useRef<string | null>(null);

  /* ------------------ CSRF bootstrap ------------------ */
  useEffect(() => {
    /* Hace un GET para que Django envíe csrftoken */
    fetch("http://localhost:8000/api/tts/csrf/", {
      credentials: "include",
    }).catch(console.error);
  }, []);

  /* ------------------ enviar texto ------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    audioRef.current?.pause();
    if (currentBlob.current) {
      URL.revokeObjectURL(currentBlob.current);
      currentBlob.current = null;
    }

    try {
      setLoading(true);
      const csrftoken = getCookie("csrftoken");
      const res = await fetch("http://localhost:8000/api/tts/generate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken || "",
        },
        credentials: "include",
        body: JSON.stringify({ text: prompt, avatarId }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error servidor:", text);
        throw new Error(text || "Error TTS");
      }

      const { audioUrl } = await res.json();
      const fullUrl = `http://localhost:8000${audioUrl}`;
      console.log("[DEBUG] Audio URL completo:", fullUrl);

      const audio = new Audio(fullUrl);
      audioRef.current = audio;

      audio.onplay = () => setPlaying(true);
      audio.onended = () => setPlaying(false);
      audio.onerror = (e) => {
        setPlaying(false);
        console.error("[DEBUG] Error en audio:", e);
        alert("Error al reproducir audio");
      };

      await audio.play();

      setResponse(`👉 ${AVATAR_NAMES[avatarId]}: «${prompt}»`);
      setPrompt("");
    } catch (err: any) {
      console.error("Error en handleSubmit:", err);
      alert("⚠️ No se pudo generar o reproducir el audio.");
    } finally {
      setLoading(false);
    }
  };



  /* ---------------------- UI ---------------------- */
  return (
    <div className="flex flex-col md:flex-row p-6 gap-6">
      {/* SECCIÓN IZQUIERDA: FORMULARIO */}
      <div className="flex-1 space-y-4">
        <h2 className="text-xl font-semibold">Texto a decir</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            value={avatarId}
            onChange={(e) => setAvatarId(Number(e.target.value))}
            className="border px-2 py-1 rounded w-full"
          >
            {Object.entries(AVATAR_NAMES).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="border px-3 py-2 w-full rounded"
            placeholder="Escribe lo que el personaje dirá"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? "Generando…" : "Hablar"}
          </button>
        </form>

        {/* Frase reproducida */}
        <div className="italic text-gray-700">
          {response && <p className="mt-4">{response}</p>}
        </div>
      </div>

      {/* SECCIÓN DERECHA: AVATAR */}
      <div className="flex-1 flex justify-center items-center">
        <AvatarModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          isPlaying={isPlaying}
          avatarId={avatarId}
        />
      </div>
    </div>
  );

};
