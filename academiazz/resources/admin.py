from django.contrib import admin
from .models import Resource, Module, PublicDocument

admin.site.register(Resource)
admin.site.register(Module)
admin.site.register(PublicDocument)
# Register your models here.
