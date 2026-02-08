from rest_framework_simplejwt.tokens import RefreshToken

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    if hasattr(user ,"students"):
        role = "student"

    elif hasattr(user, "teacher"):
        role = 'teacher'


    refresh['user_id'] = user.id
    
    return {
        'refresh' : str(refresh),
        'access': str(refresh.access_token),
        'role': role
    }
