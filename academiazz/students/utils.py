from django.core.mail import send_mail
from django.conf import settings


def send_student_welcome_email(user, raw_password):
    subject = "Welcome to Academiaz — Your Account Details"
    message = f"""
Hello {user.first_name} {user.last_name},

Your student account has been created on Academiaz.

Here are your login credentials:

    Username : {user.username}
    Password : {raw_password}

Important: You will use your username ({user.username}) to log in — not your email.

Please log in and change your password as soon as possible.

Login here: http://localhost:5173/

Regards,
Academiaz Team
"""
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )