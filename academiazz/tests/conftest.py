import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def authenticated_client(db):
    user = User.objects.create_user(
        username="testuser",
        password="testpass123"
    )
    

    client = APIClient()
    response = client.post("/api/login/", {
        "username": "testuser",
        "password": "testpass123"
    }, format="json")
    
    token = response.data["access"]
    
    
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    
    return client

@pytest.fixture(autouse=True)
def mock_insightface():
    with patch('facial_recognition.utils.insightface.app.FaceAnalysis') as mock:
        mock.return_value = MagicMock()
        yield mock
