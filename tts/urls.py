from django.urls import path
from .views import TTSView, generar_audio, get_csrf   # importa todo lo que uses
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", TTSView.as_view(), name="tts_root"),
    path("csrf/",     get_csrf,      name="get_csrf"),
    path("generate/", generar_audio, name="generate_audio"),
]

if settings.DEBUG:
    urlpatterns += static('/audios/', document_root=settings.FRONTEND_AUDIO_PATH)
