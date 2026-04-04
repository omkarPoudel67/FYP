import pytest
from django.contrib.auth import get_user_model
from resources.models import Module, Resource
from schedules.models import Group

User = get_user_model()

# ==================
# Fixtures
# ==================
@pytest.fixture
def module(db):
    return Module.objects.create(name="Python", code="PY101")

@pytest.fixture
def group(db, module):
    group = Group.objects.create(name="Group A")
    group.module.add(module)
    return group

@pytest.fixture
def resource(db, module):
    return Resource.objects.create(
        title="Test Resource",
        description="Test Description",
        module=module,
        level="beginner",
        week=1,
        uploaded_by="teacher"
    )

# ==================
# get_modules tests
# ==================
def test_get_modules_no_group_id(authenticated_client):
    response = authenticated_client.get("/resources/modules/")
    assert response.status_code == 400
    assert response.data["error"] == "Group ID parameter is required"

def test_get_modules_invalid_group_id(authenticated_client, db):
    response = authenticated_client.get("/resources/modules/?group_id=999")
    assert response.status_code == 404
    assert response.data["error"] == "Group not found"

def test_get_modules_valid_group(authenticated_client, group):
    response = authenticated_client.get(f"/resources/modules/?group_id={group.id}")
    assert response.status_code == 200
    assert "Python" in response.data["modules"]

# ==================
# get_weeks tests
# ==================
def test_get_weeks_no_module(authenticated_client, db):
    response = authenticated_client.get("/resources/weeks/")
    assert response.status_code == 400
    assert response.data["error"] == "Module name parameter required"

def test_get_weeks_no_resources(authenticated_client, db, module):
    response = authenticated_client.get("/resources/weeks/?module=Python")
    assert response.status_code == 404

def test_get_weeks_valid_module(authenticated_client, resource):
    response = authenticated_client.get("/resources/weeks/?module=Python")
    assert response.status_code == 200
    assert 1 in response.data["weeks"]

# ==================
# get_resources tests
# ==================
def test_get_resources_missing_params(authenticated_client, db):
    response = authenticated_client.get("/resources/resources/")
    assert response.status_code == 400
    assert response.data["error"] == "Module and week parameters required"

def test_get_resources_invalid_module(authenticated_client, db):
    response = authenticated_client.get("/resources/resources/?module=Nothing&week=1")
    assert response.status_code == 404

def test_get_resources_no_resources_for_week(authenticated_client, module):
    response = authenticated_client.get("/resources/resources/?module=Python&week=99")
    assert response.status_code == 404

def test_get_resources_valid(authenticated_client, resource):
    response = authenticated_client.get("/resources/resources/?module=Python&week=1")
    assert response.status_code == 200
    assert response.data[0]["title"] == "Test Resource"