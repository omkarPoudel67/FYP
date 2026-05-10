from django.urls import path
from .views import ChatbotView, PublicChatbotView

urlpatterns = [
   path('chat/', ChatbotView.as_view(), name='chatbot'),
   path('chat/public/', PublicChatbotView.as_view(), name='public-chat'),
]