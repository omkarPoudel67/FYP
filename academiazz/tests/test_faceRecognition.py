import pytest
import numpy as np
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model
import io

User = get_user_model()

def test_face_login_non_post_request(api_client, db):
    response = api_client.get("/api/facial-recognition/login-face/")
    assert response.status_code == 400
    assert response.json()["success"] == False


def test_face_login_no_image(api_client, db):
    with patch('facial_recognition.views.init_face_model') as mock_model, \
         patch('facial_recognition.views.init_pinecone_index') as mock_pinecone:
        
        mock_model.return_value = MagicMock()
        mock_pinecone.return_value = MagicMock()

        response = api_client.post("/api/facial-recognition/login-face/")
        assert response.status_code == 400
        assert response.json()["success"] == False
        assert response.json()["message"] == "No image uploaded."


def test_face_login_no_face_detected(api_client, db):
    with patch('facial_recognition.views.init_face_model') as mock_model, \
         patch('facial_recognition.views.init_pinecone_index') as mock_pinecone, \
         patch('facial_recognition.views.get_face_embedding') as mock_embedding:

        mock_model.return_value = MagicMock()
        mock_pinecone.return_value = MagicMock()
        mock_embedding.return_value = None  # ← no face

        fake_image = io.BytesIO(b"fake image content")
        fake_image.name = "test.jpg"

        response = api_client.post(
            "/api/facial-recognition/login-face/",
            {"image": fake_image},
        )
        assert response.status_code == 400
        assert response.json()["success"] == False
        assert response.json()["message"] == "No face detected."


def test_face_login_no_match(api_client, db):
    with patch('facial_recognition.views.init_face_model') as mock_model, \
         patch('facial_recognition.views.init_pinecone_index') as mock_pinecone, \
         patch('facial_recognition.views.get_face_embedding') as mock_embedding, \
         patch('facial_recognition.views.find_best_match') as mock_match:

        mock_model.return_value = MagicMock()
        mock_pinecone.return_value = MagicMock()
        mock_embedding.return_value = np.random.rand(512)
        mock_match.return_value = (False, None, 0.0)  # ← no match

        fake_image = io.BytesIO(b"fake image content")
        fake_image.name = "test.jpg"

        response = api_client.post(
            "/api/facial-recognition/login-face/",
            {"image": fake_image},
        )
        assert response.status_code == 200
        assert response.json()["success"] == False
        assert response.json()["message"] == "Face not recognized."


def test_face_login_success(api_client, db):
    user = User.objects.create_user(username="testuser", password="1234")

    with patch('facial_recognition.views.init_face_model') as mock_model, \
         patch('facial_recognition.views.init_pinecone_index') as mock_pinecone, \
         patch('facial_recognition.views.get_face_embedding') as mock_embedding, \
         patch('facial_recognition.views.find_best_match') as mock_match:

        mock_model.return_value = MagicMock()
        mock_pinecone.return_value = MagicMock()
        mock_embedding.return_value = np.random.rand(512)
        mock_match.return_value = (True, str(user.id), 0.95)  # ← match!

        fake_image = io.BytesIO(b"fake image content")
        fake_image.name = "test.jpg"

        response = api_client.post(
            "/api/facial-recognition/login-face/",
            {"image": fake_image},
        )
        assert response.status_code == 200
        assert response.json()["success"] == True
        assert "access" in response.json()
        assert response.json()["username"] == "testuser"

def test_face_register_no_image(authenticated_client):
    with patch('facial_recognition.views.init_face_model') as mock_model:
        mock_model.return_value = MagicMock()

        response = authenticated_client.post("/api/facial-recognition/face-register/")
        assert response.status_code == 400
        assert response.json()["success"] == False
        assert response.json()["message"] == "No image provided"


def test_face_register_no_face(authenticated_client):
    with patch('facial_recognition.views.get_face_embedding') as mock_embedding, \
         patch('facial_recognition.views.cv2.imdecode') as mock_imdecode:

        mock_imdecode.return_value = np.zeros((100, 100, 3), dtype=np.uint8)  # ← fake valid image
        mock_embedding.return_value = None  # ← no face detected

        fake_image = io.BytesIO(b"fake image content")
        fake_image.name = "test.jpg"

        response = authenticated_client.post(
            "/api/facial-recognition/face-register/",
            {"image": fake_image},
        )
        assert response.status_code == 400
        assert response.json()["success"] == False
        assert response.json()["message"] == "No face detected"


def test_face_register_success(authenticated_client):
    with patch('facial_recognition.views.get_face_embedding') as mock_embedding, \
         patch('facial_recognition.views.store_embedding') as mock_store, \
         patch('facial_recognition.views.cv2.imdecode') as mock_imdecode:

        mock_imdecode.return_value = np.zeros((100, 100, 3), dtype=np.uint8)  # ← fake valid image
        mock_embedding.return_value = np.random.rand(512)
        mock_store.return_value = None

        fake_image = io.BytesIO(b"fake image content")
        fake_image.name = "test.jpg"

        response = authenticated_client.post(
            "/api/facial-recognition/face-register/",
            {"image": fake_image},
        )
        assert response.status_code == 200
        assert response.json()["success"] == True
        assert response.json()["message"] == "Face registered successfully"