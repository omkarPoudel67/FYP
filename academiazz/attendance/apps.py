from django.apps import AppConfig

class AttendanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'attendance'

    def ready(self):
        try:
            from django.core.management import call_command
            call_command('create_sessions')
        except Exception as e:
            print("Skipping create_sessions:", e)
