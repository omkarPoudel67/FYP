from rest_framework import serializers
from attendance.models import AttendanceHistory, ClassSession
from students.models import Students
from schedules.models import Group
from django.db import models

class StudentAttendanceSummarySerializer(serializers.ModelSerializer):
    """Used in ManageAttendance list — one row per student"""
    first_name    = serializers.CharField(source='user.first_name')
    last_name     = serializers.CharField(source='user.last_name')
    username      = serializers.CharField(source='user.username')
    group_name    = serializers.SerializerMethodField()
    total_classes = serializers.SerializerMethodField()
    present_count = serializers.SerializerMethodField()
    absent_count  = serializers.SerializerMethodField()
    attendance_pct = serializers.SerializerMethodField()

    class Meta:
        model  = Students
        fields = [
            'id', 'first_name', 'last_name', 'username',
            'semester', 'year', 'group_name',
            'total_classes', 'present_count', 'absent_count', 'attendance_pct'
        ]

    def get_group_name(self, obj):
        return obj.group.name if obj.group else None

    def _get_records(self, obj):
        # cache on the instance to avoid multiple queries
        if not hasattr(obj, '_attendance_cache'):
            obj._attendance_cache = list(
                AttendanceHistory.objects.filter(student=obj)
            )
        return obj._attendance_cache

    def get_total_classes(self, obj):
        return len(self._get_records(obj))

    def get_present_count(self, obj):
        return sum(1 for r in self._get_records(obj) if r.status == 'present')

    def get_absent_count(self, obj):
        return sum(1 for r in self._get_records(obj) if r.status == 'absent')

    def get_attendance_pct(self, obj):
        records = self._get_records(obj)
        if not records:
            return 0
        present = sum(1 for r in records if r.status == 'present')
        return round((present / len(records)) * 100, 1)


class StudentAttendanceDetailSerializer(serializers.Serializer):
    """Used in StudentAttendance detail page"""

    def to_representation(self, student):
        records = AttendanceHistory.objects.filter(
            student=student
        ).select_related('schedule__module').order_by('date')

        # ── basic student info ──────────────────────────────────────
        student_info = {
            "id":         student.id,
            "first_name": student.user.first_name,
            "last_name":  student.user.last_name,
            "username":   student.user.username,
            "email":      student.user.email,
            "semester":   student.semester,
            "year":       student.year,
            "group":      student.group.name if student.group else None,
        }

        # ── aggregate stats ─────────────────────────────────────────
        total   = records.count()
        present = records.filter(status='present').count()
        absent  = records.filter(status='absent').count()
        late    = records.filter(status='late').count()
        overall_pct = round((present / total) * 100, 1) if total else 0

        # ── per-module breakdown ────────────────────────────────────
        from django.db.models import Count, Q
        module_stats = records.values(
            module_name=models.F('schedule__module__name')
        ).annotate(
            total=Count('id'),
            present=Count('id', filter=Q(status='present')),
            absent=Count('id',  filter=Q(status='absent')),
        ).order_by('module_name')

        module_breakdown = []
        for m in module_stats:
            pct = round((m['present'] / m['total']) * 100, 1) if m['total'] else 0
            module_breakdown.append({
                "module_name":    m['module_name'],
                "total_classes":  m['total'],
                "present_count":  m['present'],
                "absent_count":   m['absent'],
                "attendance_pct": pct,
            })

        # ── insights ────────────────────────────────────────────────
        insights = self._build_insights(overall_pct, present, absent, late, total, module_breakdown)

        # ── chart data (cumulative % by date, optionally per module) ─
        # frontend will filter this; send all records grouped by date + module
        chart_records = list(records.values(
            'date',
            module_name=models.F('schedule__module__name'),
            record_status=models.F('status')
        ).order_by('date'))

        # ── history list (raw records for the list below the graph) ──
        history = list(records.values(
            'id', 'date', 'status', 'marked_at',
            module_name=models.F('schedule__module__name'),
            location=models.F('schedule__location'),
        ).order_by('-date'))

        # ── unique module names for dropdown ─────────────────────────
        module_names = sorted(set(r['module_name'] for r in chart_records if r['module_name']))

        return {
            "student":          student_info,
            "stats": {
                "total_classes":  total,
                "present_count":  present,
                "absent_count":   absent,
                "late_count":     late,
                "overall_pct":    overall_pct,
            },
            "insights":         insights,
            "module_breakdown": module_breakdown,
            "chart_records":    chart_records,
            "history":          history,
            "module_names":     module_names,
        }

    def _build_insights(self, overall_pct, present, absent, late, total, module_breakdown):
        insights = []

        # attendance health
        if overall_pct >= 90:
            insights.append({"type": "positive", "text": f"Excellent attendance at {overall_pct}% — well above the 75% requirement."})
        elif overall_pct >= 75:
            insights.append({"type": "neutral",  "text": f"Attendance is at {overall_pct}%, meeting the minimum 75% requirement."})
        else:
            classes_needed = max(0, round((0.75 * total - present) / 0.25)) if total else 0
            insights.append({"type": "warning",  "text": f"Attendance is at {overall_pct}%, below the 75% threshold. Needs to attend {classes_needed} more consecutive classes to recover."})

        # absent count
        if absent > 0:
            insights.append({"type": "info", "text": f"Missed {absent} class{'es' if absent > 1 else ''} out of {total} total."})

        if late > 0:
            insights.append({"type": "info", "text": f"Marked late {late} time{'s' if late > 1 else ''}."})

        # best and worst module
        if module_breakdown:
            sorted_mods = sorted(module_breakdown, key=lambda x: x['attendance_pct'])
            worst = sorted_mods[0]
            best  = sorted_mods[-1]

            if worst['attendance_pct'] < 75:
                insights.append({"type": "warning", "text": f"Weakest module is {worst['module_name']} at {worst['attendance_pct']}% — at risk."})
            if best['attendance_pct'] >= 90:
                insights.append({"type": "positive", "text": f"Best module is {best['module_name']} at {best['attendance_pct']}%."})

            # most missed
            most_missed = sorted_mods[0]
            insights.append({"type": "info", "text": f"Most missed module: {most_missed['module_name']} ({most_missed['absent_count']} absences)."})

        return insights

class AttendanceHistorySerializer(serializers.ModelSerializer):
    module_name = serializers.CharField(source='schedule.module.name', read_only=True)
    location = serializers.CharField(source='schedule.location', read_only=True)

    class Meta:
        model = AttendanceHistory
        fields = ['status', 'module_name', 'location', 'date']

class ClassSessionSerializer(serializers.ModelSerializer):
    module_name = serializers.CharField(source='schedule.module.name', read_only=True)
    location = serializers.CharField(source='schedule.location', read_only=True)
    start_time = serializers.TimeField(source='schedule.start_time', read_only=True)
    end_time = serializers.TimeField(source='schedule.end_time', read_only=True)

    class Meta:
        model = ClassSession
        fields = [
            'id',
            'date',
            'status',
            'module_name',
            'location',
            'start_time',
            'end_time'
        ]