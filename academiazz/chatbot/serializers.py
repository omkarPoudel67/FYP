from rest_framework import serializers

class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField(
        max_length=1000,
        help_text="The question or message from the student"
    )
    chat_history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list,
        help_text="Previous messages in the conversation"
    )

class ChatResponseSerializer(serializers.Serializer):
    response = serializers.CharField(
        help_text="The assistant's response"
    )
    chat_history = serializers.ListField(
        child=serializers.DictField(),
        help_text="Updated conversation history including this exchange"
    )