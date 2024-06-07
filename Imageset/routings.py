from django.urls import re_path
from app01 import register, login, target, recognize

websocket_urlpatterns = [
    re_path(r'ws/register/$', register.RegisterConsumer.as_asgi()),
    re_path(r'ws/login/$', login.LoginConsumer.as_asgi()),
    re_path(r'ws/target/$', target.TargetConsumer.as_asgi()),
    re_path(r'ws/recognize/$', recognize.RecognizeConsumer.as_asgi())
]
