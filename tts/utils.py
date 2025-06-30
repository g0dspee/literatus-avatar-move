# tts/utils.py
import os
import uuid
from pathlib import Path
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs               # import correcto
from django.conf import settings

load_dotenv()
XI_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Instancia global del cliente
elevenlabs = ElevenLabs(api_key=XI_API_KEY)

VOICE_MAP = {
    1: "AFkIMdmeB0MMrr1tgGds",  # Príncipe
    2: "piI8Kku0DcvcL6TTSeQt",  # Golondrina
    3: "pQ7aOU0H31SmMd2WShoD",  # Costurera
    4: "hiPC4cjSffoQRpHMhg58",  # Hijo Costurera
    5: "pIrKgDiRIiy46523FIXN",  # Dramaturgo
    6: "QzgYVYSNBgksoEWDkpKt",  # Vendedora de Cerillas
    7: "zQzvQBubVkDWYuqJYMFn",  # Alcalde
    8: "QMJTqaMXmGnG8TCm8WQG",  # Concejal
    9: "dG7SBJDxDoZkQUrwvqrD",  # Fundidor
    10: "z1eZeC0h1LWcGj4jyCjq", # Ángel
    11: "qNkzaJoHLLdpvgh5tISm", # Dios
    12: "emSmWzY0c0xtx5IFMCVv", # Niño pobre (voz 1)
    13: "H8BjWxFjrzNszTO74noq", # Niño pobre (voz 2)
    14: "goT3UYdM9bhm0n2lmKQx", # Oscar Wilde
    15: "UGTtbzgh3HObxRjWaSpr", # Narrador H
    16: "vlS1ohKzOkKzVrkOUAOG", # Narradora M
    17: "QZ1okeFI43NQd6lXAzQ5", # Estatua
}

# Carpeta pública del frontend donde se guardarán los MP3
AUDIO_DIR = Path(settings.BASE_DIR).parent / "avatar-test" / "public" / "audios"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)


def eleven_to_file(text: str, avatar_id: int) -> str:
    """
    Genera audio con ElevenLabs, lo guarda en /avatar-test/public/audios/
    y devuelve la URL pública (ej. /audios/abc123.mp3) para reproducir
    desde el frontend.
    """
    print(f"[utils] eleven_to_file called with text={text} avatar_id={avatar_id}")

    voice_id = VOICE_MAP.get(avatar_id)
    if not voice_id:
        raise ValueError("avatarId inválido")

    try:
        audio_bytes = elevenlabs.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id="eleven_turbo_v2_5",
            language_code="spa",
            output_format="mp3_44100_128",
        )
        print("[utils] Audio bytes length:", len(audio_bytes))
        print("[utils] Audio bytes head:", audio_bytes[:100])
    except Exception as e:
        print("[utils] Error desde ElevenLabs:", e)
        raise

    filename = f"{uuid.uuid4().hex[:8]}.mp3"
    abs_path = AUDIO_DIR / filename
    print("[utils] Guardando en:", abs_path)

    with open(abs_path, "wb") as f:
        f.write(audio_bytes)

    print("[utils] Archivo escrito OK")

    # URL accesible desde React (sirve Vite / carpeta public)
    return f"/audios/{filename}"
