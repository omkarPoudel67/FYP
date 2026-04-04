import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError



User = get_user_model()

def test_duplicate_username(db):
    User.objects.create_user(username="test", password="1234")
    with pytest.raises(IntegrityError):
        User.objects.create_user(username="test", password="1234")

def test_duplicate_phone_number(db):
    User.objects.create_user(username="test1", password="1234", phone_number="9876543210")
    with pytest.raises(IntegrityError):
        User.objects.create_user(username="test2", password="1234", phone_number="9876543210")


def test_invalid_phone_number(db):
    from django.core.exceptions import ValidationError
    user = User(username="test", password="1234", phone_number="abc")
    with pytest.raises(ValidationError):
        user.full_clean()