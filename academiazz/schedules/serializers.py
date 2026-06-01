from rest_framework import serializers
from .models import Group, Schedule
from resources.models import Module
from teachers.models import Teachers


class GroupSerializer(serializers.ModelSerializer):
    modules = serializers.SerializerMethodField()
    students = serializers.SerializerMethodField()
    student_count = serializers.IntegerField(source="students.count", read_only=True)

    class Meta:
        model = Group
        fields = ["id", "name", "module", "modules", "students", "student_count"]

    def get_modules(self, obj):
        return [{"id": m.id, "name": m.name, "code": m.code} for m in obj.module.all()]

    def get_students(self, obj):
        return [
            {
                "id": s.pk,
                "full_name": f"{s.user.first_name} {s.user.last_name}".strip(),
                "username": s.user.username,
                "year": s.year,
                "semester": s.semester,
            }
            for s in obj.students.select_related("user").all()
        ]


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = "__all__"
    
# ADD below your existing serializers

class GroupCreateUpdateSerializer(serializers.ModelSerializer):
    module = serializers.PrimaryKeyRelatedField(
        queryset=Module.objects.all(),
        many=True,
        required=False,
    )

    class Meta:
        model = Group
        fields = ["id", "name", "module"]
    
    def validate_module(self, value):
    # Rule 1: max 6 modules
        if len(value) > 6:
            raise serializers.ValidationError(
                "A group can have a maximum of 6 modules."
            )

        # Rule 2: semester consistency rule
        semesters = sorted([m.semester for m in value])

        # OPTION A (STRICT): all modules must be same semester
        if len(set(semesters)) > 1:
            raise serializers.ValidationError(
                "All modules in a group must belong to the same semester."
            )

        return value

    def validate_name(self, value):
        qs = Group.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A group with this name already exists.")
        return value

    def create(self, validated_data):
        modules = validated_data.pop("module", [])
        group = Group.objects.create(**validated_data)
        group.module.set(modules)
        return group

    def update(self, instance, validated_data):
        modules = validated_data.pop("module", None)
        instance.name = validated_data.get("name", instance.name)
        instance.save()
        if modules is not None:
            instance.module.set(modules)
        return instance

    
class ScheduleCreateUpdateSerializer(serializers.ModelSerializer):
    teacher = serializers.PrimaryKeyRelatedField(
        queryset=Teachers.objects.all(),
        required=False,
        allow_null=True,
    )
    class Meta:
        model = Schedule
        fields = [
            "id", "module", "group", "class_type",
            "teacher", "day", "start_time", "end_time",
            "location", "description",
        ]

    def validate(self, data):
        start_time = data.get("start_time", getattr(self.instance, "start_time", None))
        end_time   = data.get("end_time",   getattr(self.instance, "end_time",   None))
        group      = data.get("group",      getattr(self.instance, "group",      None))
        day        = data.get("day",        getattr(self.instance, "day",        None))

        if start_time and end_time:
            if end_time <= start_time:
                raise serializers.ValidationError(
                    {"end_time": "End time must be after start time."}
                )

        if group and day and start_time and end_time:
            overlapping = Schedule.objects.filter(
                group=group,
                day=day,
                start_time__lt=end_time,
                end_time__gt=start_time,
            )
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)

            if overlapping.exists():
                clash = overlapping.first()
                raise serializers.ValidationError(
                    f"This group already has a class from "
                    f"{clash.start_time.strftime('%H:%M')} to "
                    f"{clash.end_time.strftime('%H:%M')} on {clash.day}. "
                    f"Please choose a different time slot."
                )

        return data