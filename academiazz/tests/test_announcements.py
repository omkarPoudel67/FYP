import pytest
from django.contrib.auth import get_user_model
from announcements.models import Announcement

User = get_user_model()

@pytest.fixture
def superuser(db):
    return User.objects.create_superuser(
        username="teacher",
        password="1234",
    )

@pytest.fixture
def create_announcement(superuser):
    return Announcement.objects.create(
        title="Test Announcement",
        description="Test Description",
        created_by=superuser
    )


def test_announcement_empty_list(authenticated_client):
    response = authenticated_client.get("/announcements/announcements/")
    assert response.status_code == 200
    assert response.data == []


def test_announcement_requires_jwt(api_client, db):
    response = api_client.get("/announcements/announcements/")
    assert response.status_code == 401  


def test_announcement_returns_correct_data(authenticated_client, create_announcement):
    response = authenticated_client.get("/announcements/announcements/")
    assert response.status_code == 200
    assert response.data[0]["title"] == "Test Announcement"
    assert response.data[0]["description"] == "Test Description"


# def test_announcement_ordered_latest_first(authenticated_client, superuser):
#     Announcement.objects.create(title="First", description="First", created_by=superuser)
#     Announcement.objects.create(title="Second", description="Second", created_by=superuser)
    
#     response = authenticated_client.get("/announcements/announcements/")
#     assert response.status_code == 200
#     assert response.data[0]["title"] == "Second"
#     assert response.data[1]["title"] == "First"