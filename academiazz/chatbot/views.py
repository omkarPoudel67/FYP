from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from langchain_core.messages import HumanMessage, AIMessage
from langchain_community.callbacks import get_openai_callback

from students.models import Students
from .serializers import ChatMessageSerializer, ChatResponseSerializer
from .rag.agent import build_agent

from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny


class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # validate incoming request
        serializer = ChatMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        message = serializer.validated_data['message']
        chat_history_data = serializer.validated_data.get('chat_history', [])

        # get the logged in student
        try:
            student = Students.objects.get(user=request.user)
        except Students.DoesNotExist:
            return Response(
                {"error": "Student profile not found for this user."},
                status=status.HTTP_404_NOT_FOUND
            )

        # convert chat history from frontend format to LangChain format
        chat_history = []
        for msg in chat_history_data:
            if msg.get('role') == 'human':
                chat_history.append(HumanMessage(content=msg['content']))
            elif msg.get('role') == 'assistant':
                chat_history.append(AIMessage(content=msg['content']))

        # build agent for this student
        agent_executor = build_agent(student)

        # invoke agent
        try:
            with get_openai_callback() as cb:
                result = agent_executor.invoke({
                    "input": message,
                    "chat_history": chat_history
                })
                response_text = result['output']
                
                print(f"Input tokens:  {cb.prompt_tokens}")
                print(f"Output tokens: {cb.completion_tokens}")
                print(f"Total tokens:  {cb.total_tokens}")

        except Exception as e:
            return Response(
                {"error": f"Agent error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # update chat history with this exchange
        chat_history_data.append({
            "role": "human",
            "content": message
        })
        chat_history_data.append({
            "role": "assistant",
            "content": response_text
        })

        # keep only last 10 messages — 5 exchanges
        # prevents context window from growing too large
        if len(chat_history_data) > 10:
            chat_history_data = chat_history_data[-10:]

        # serialize and return response
        response_serializer = ChatResponseSerializer({
            "response": response_text,
            "chat_history": chat_history_data
        })

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK
        )