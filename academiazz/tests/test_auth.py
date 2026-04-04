import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()
username = "test"
password = "1234"

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user(db):
    user = User.objects.create_user(
        username = username,
        password = password 
    )
    return user

def test_user_login(create_user,api_client):
    response = api_client.post("/api/login/",{
        "username": username,
        "password": password
    })
    assert response.status_code == 200
    assert response.data["success"] == True
    assert "access" in response.data 


def test_user_login_invalid_credentials(create_user, api_client):
    response = api_client.post("/api/login/",{
        "username":"wrong",
        "password":"wrong"
    })

    assert response.status_code == 401 


def test_user_login_empty_credentials(api_client, db):
    response = api_client.post("/api/login/",{
        "username":"",
        "password":""
    })

    assert response.status_code == 401


