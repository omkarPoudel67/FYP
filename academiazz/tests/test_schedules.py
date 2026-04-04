import pytest
from django.contrib.auth import get_user_model
from schedules.models import Group, Schedule
from resources.models import Module

User = get_user_model()

@pytest.fixture
def module(db):
    return Module.objects.create(name="Python", code="PY101")

@pytest.fixture
def group(db, module):
    group = Group.objects.create(name="Group A")
    group.module.add(module)
    return group

@pytest.fixture
def teacher(db):
    return User.objects.create_user(username="teacher", password="1234")

@pytest.fixture
def schedule(db, module, group, teacher):
    return Schedule.objects.create(
        module=module,
        group=group,
        class_type="lecture",
        teacher=teacher,
        day="Mon",
        start_time="09:00",
        end_time="11:00",
        location="Room 101"
    )


def test_get_all_schedules(authenticated_client, schedule):
    response = authenticated_client.get("/schedule/schedules/")
    assert response.status_code == 200
    assert len(response.data) == 1

def test_get_schedules_by_group(authenticated_client, schedule, group):
    response = authenticated_client.get(f"/schedule/schedules/?group={group.id}")
    assert response.status_code == 200
    assert len(response.data) == 1

def test_get_schedules_invalid_group(authenticated_client, db):
    response = authenticated_client.get("/schedule/schedules/?group=999")
    assert response.status_code == 404
    assert response.data["error"] == "Group not found"

def test_get_schedules_empty(authenticated_client, db):
    response = authenticated_client.get("/schedule/schedules/")
    assert response.status_code == 200
    assert len(response.data) == 0


def test_schedule_end_time_before_start_time(db, module, group, teacher):
    from django.core.exceptions import ValidationError
    with pytest.raises(ValidationError):
        Schedule.objects.create(
            module=module,
            group=group,
            class_type="lecture",
            teacher=teacher,
            day="Mon",
            start_time="11:00",
            end_time="09:00",  
            location="Room 101"
        )

def test_schedule_overlapping_classes(db, module, group, teacher, schedule):
    from django.core.exceptions import ValidationError
    with pytest.raises(ValidationError):
        Schedule.objects.create(
            module=module,
            group=group,
            class_type="tutorial",
            teacher=teacher,
            day="Mon",
            start_time="10:00",  
            end_time="12:00",
            location="Room 102"
        )