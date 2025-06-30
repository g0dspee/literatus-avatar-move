import os, uuid, json, httpx
from pathlib import Path
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .utils import eleven_to_file
from django.http import JsonResponse
from dotenv import load_dotenv
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from elevenlabs.client import ElevenLabs
from django.conf import settings

def health(request):
    return JsonResponse({"status": "ok"})

load_dotenv()
XI_API_KEY = os.getenv("XI_API_KEY")

VOICE_IDS = {
    1: "AFkIMdmeB0MMrr1tgGds",
    2: "piI8Kku0DcvcL6TTSeQt",
    3: "pQ7aOU0H31SmMd2WShoD",
    4: "hiPC4cjSffoQRpHMhg58",
    5: "pIrKgDiRIiy46523FIXN",
    6: "QzgYVYSNBgksoEWDkpKt",
    7: "zQzvQBubVkDWYuqJYMFn",
    8: "QMJTqaMXmGnG8TCm8WQG",
    9: "dG7SBJDxDoZkQUrwvqrD",
    10: "z1eZeC0h1LWcGj4jyCjq",
    11: "qNkzaJoHLLdpvgh5tISm",
    12: "emSmWzY0c0xtx5IFMCVv",
    13: "H8BjWxFjrzNszTO74noq",
    14: "goT3UYdM9bhm0n2lmKQx",
    15: "UGTtbzgh3HObxRjWaSpr",
    16: "vlS1ohKzOkKzVrkOUAOG",
    17: "QZ1okeFI43NQd6lXAzQ5",
}

abs_dir = settings.FRONTEND_AUDIO_PATH
filename = f"{uuid.uuid4().hex[:8]}.mp3" 
os.makedirs(abs_dir, exist_ok=True)
abs_path = os.path.join(abs_dir, filename)

AUDIO_DIR = Path(settings.BASE_DIR).parent / "avatar-test" / "public" / "audios"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
 

class TTSView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("Request data:", request.data)
        
        text = request.data.get("text", "")
        avatar_id = int(request.data.get("avatarId", 0))
        
        print(f"Received text: {text}")
        print(f"Received avatar_id: {avatar_id}")

        if not text or avatar_id == 0:
            print("Error: faltan datos")
            return Response({"detail": "faltan datos"}, status=400)

        try:
            audio_url = eleven_to_file(text, avatar_id)  # sin await
            print(f"Audio generado: {audio_url}")
        except Exception as e:
            print(f"Error en generación de audio: {e}")
            return Response({"detail": "Error TTS"}, status=502)

        return Response({"audioUrl": f"/{audio_url}"})

    



import os, json, uuid
from pathlib import Path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv
import httpx
from elevenlabs.client import ElevenLabs
from django.conf import settings

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("XI_API_KEY")

elevenlabs = ElevenLabs(api_key=ELEVENLABS_API_KEY)

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

AUDIO_DIR = Path(settings.BASE_DIR).parent / "avatar-test" / "public" / "audios"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

@csrf_exempt
def generar_audio(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Método no permitido"}, status=405)

    try:
        data = json.loads(request.body)
        text = data.get("text", "").strip()
        avatar_id = int(data.get("avatarId", 0))
        if not text or avatar_id not in VOICE_MAP:
            return JsonResponse({"detail": "Datos inválidos"}, status=400)
        
        voice_id = VOICE_MAP[avatar_id]

        # Generar audio con SDK ElevenLabs
        audio_bytes_gen = elevenlabs.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id="eleven_turbo_v2_5",
            language_code="en",
            output_format="mp3_44100_128",
        )

        # Detectar si es un generator y convertir a bytes
        if hasattr(audio_bytes_gen, '__iter__') and not isinstance(audio_bytes_gen, (bytes, bytearray)):
            audio_bytes = b"".join(audio_bytes_gen)
        else:
            audio_bytes = audio_bytes_gen

        # Guardar archivo mp3
        filename = f"{uuid.uuid4().hex}.mp3"
        abs_path = AUDIO_DIR / filename
        with open(abs_path, "wb") as f:
            f.write(audio_bytes)

        public_url = f"/audios/{filename}"
        return JsonResponse({"audioUrl": public_url})

    except Exception as e:
        return JsonResponse({"detail": str(e)}, status=500)

        
        
@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

def csrf_token_view(request):
    return JsonResponse({ "csrfToken": get_token(request) })

