import os
from dotenv import load_dotenv
from langchain_ollama import ChatOllama
from langchain_classic.agents import AgentExecutor
from langchain_classic.agents import create_tool_calling_agent
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage
from langchain_groq import ChatGroq
from django.db.models import Count, Q
from django.utils import timezone
from typing import Optional
from .indexer import query_resource
from django.conf import settings
from chatbot.rag.indexer import query_resource
from resources.models import Resource
from attendance.models import AttendanceHistory, ClassSession
from schedules.models import Schedule
from students.models import Students
from announcements.models import Announcement
from resources.models import Module

def truncate_text(text: str, max_chars: int = 1500) -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "... [truncated]"

SYSTEM_PROMPT = """You are a helpful academic assistant for a student at Academiazz.
You have access to the student's complete academic information through a set of tools.

Your personality:
- Friendly and supportive
- Clear and concise in your answers
- Honest — if you don't have information, say so
- Proactive — if you notice something concerning like low attendance, mention it

How you work:
- You have tools that fetch real data about the student
- Always use tools to get accurate data before answering
- Never make up attendance numbers, dates, or schedules
- Base your answers only on what the tools return

When answering:
- Be conversational — not robotic
- Format numbers clearly e.g "72% (29 out of 40 classes)"
- If attendance is below 75% warn the student
- Always mention the source e.g "According to your attendance record..."

Important — how to handle resource content:
- The summary you receive from get_class_resources is made of short extracted sentences, one per chunk of the document
- These sentences are not connected — they are independently pulled from different parts of the material
- Do NOT read them as a flowing paragraph — treat each bullet point as a separate topic hint
- When answering, synthesize and group related points together into a coherent response
- Never repeat the bullet points word for word — always rewrite in your own words
- If the content seems incomplete or disconnected, acknowledge it and offer what you can
- Never fabricate content that is not present in the bullets
When sharing download links, present them as plain text like:
Download: https://yourdomain.com/resources/download/42/
Never wrap links in HTML tags like <a href>.
Today's date is: {today}
The student you are helping is: {student_name}
"""

_llm = None

def get_llm():
    load_dotenv()
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            api_key=os.getenv("GROQ_API_KEY"),
            model="openai/gpt-oss-120b",
            temperature=0.3
        )
    return _llm


class StudentTools:
    def __init__(self, student):
        self.student = student

    def get_tools(self):
        student = self.student 
     
        @tool
        def get_attendance_summary(module_name: Optional[str] = None) -> str:
            """
            Use this when student asks about:
            - attendance percentage or record
            - how many classes they attended or missed
            - risk of failing or detention due to attendance
            - absence count in any subject
            - overall attendance status
            Use module_name if asking about a specific subject.
            Leave module_name empty if asking about all subjects.
            """
            query = AttendanceHistory.objects.filter(student=student)

            if module_name:
                query = query.filter(
                    schedule__module__name__icontains=module_name
                )

            summary = (
                query
                .values(
                    'schedule__module__name',
                    'schedule__module__code'
                )
                .annotate(
                    total=Count('id'),
                    present=Count('id', filter=Q(status='present')),
                    absent=Count('id', filter=Q(status='absent')),
                    late=Count('id', filter=Q(status='late')),
                )
            )

            if not summary:
                return "No attendance records found."

            lines = []
            for record in summary:
                total = record['total']
                present = record['present']
                absent = record['absent']
                late = record['late']
                module = record['schedule__module__name']
                code = record['schedule__module__code']

                percentage = round((present / total) * 100, 1) if total > 0 else 0
                status = " AT RISK" if percentage < 75 else " SATISFACTORY"

                lines.append(
                    f"{module} ({code}): {percentage}% "
                    f"({present} present, {absent} absent, {late} late "
                    f"out of {total} classes) — {status}"
                )

            return "\n".join(lines) 
        
        @tool
        def get_schedule(
            day: Optional[str] = None,
            module_name: Optional[str] = None,
            get_next: bool = False,
            get_today: bool = False
        ) -> str:
            """
            Use this when student asks about:
            - their class schedule or timetable
            - what classes they have on a specific day
            - what classes they have today
            - when is their next class
            - what time a class starts or ends
            - which room a class is in
            - who teaches a class
            Use day for specific day e.g 'Mon', 'Tue'.
            Use get_next=True for next upcoming class.
            Use get_today=True for today's classes only.
            Use module_name for a specific subject schedule.
            """
            query = Schedule.objects.filter(group=student.group)

            if module_name:
                query = query.filter(
                    module__name__icontains=module_name
                )

            if day:
                query = query.filter(day__icontains=day)

            if get_today:
                today_abbr = timezone.localdate().strftime("%a")
                query = query.filter(day=today_abbr)

            if get_next:
                today = timezone.localdate()
                today_abbr = today.strftime("%a")
                current_time = timezone.localtime().time()

                day_order = {
                    "Mon": 0, "Tue": 1, "Wed": 2,
                    "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6
                }
                today_index = day_order.get(today_abbr, 0)

                all_schedules = Schedule.objects.filter(
                    group=student.group
                )

                next_class = None
                min_distance = float('inf')

                for schedule in all_schedules:
                    schedule_day_index = day_order.get(schedule.day, 0)

                    if schedule_day_index > today_index:
                        days_until = schedule_day_index - today_index
                    elif schedule_day_index == today_index:
                        if schedule.start_time > current_time:
                            days_until = 0
                        else:
                            days_until = 7
                    else:
                        days_until = 7 - (today_index - schedule_day_index)

                    if days_until < min_distance:
                        min_distance = days_until
                        next_class = schedule

                if next_class:
                    return (
                        f"Next class: {next_class.module} "
                        f"on {next_class.get_day_display()} "
                        f"at {next_class.start_time.strftime('%I:%M %p')} "
                        f"until {next_class.end_time.strftime('%I:%M %p')} "
                        f"in Room: {next_class.location or 'TBA'} "
                        f"with {next_class.teacher.get_full_name() if next_class.teacher else 'TBA'}"
                    )
                return "No upcoming classes found."

            if not query.exists():
                return "No schedule found."

            lines = []
            for schedule in query:
                lines.append(
                    f"{schedule.get_day_display()} | "
                    f"{schedule.start_time.strftime('%I:%M %p')} - "
                    f"{schedule.end_time.strftime('%I:%M %p')} | "
                    f"{schedule.module} | "
                    f"{schedule.class_type.upper()} | "
                    f"Room: {schedule.location or 'TBA'} | "
                    f"Teacher: {schedule.teacher.get_full_name() if schedule.teacher else 'TBA'}"
                )
            return "\n".join(lines)
        @tool
        def get_student_info() -> str:
            """
            Use this when student asks about:
            - their personal academic profile
            - what semester or year they are in
            - what group they belong to
            - their role in the system
            - what modules or subjects they are enrolled in
            - general information about themselves
            """
            # group can be null — handle safely
            if student.group:
                modules = student.group.module.all()
                module_list = ", ".join(
                    [f"{m.code} - {m.name}" for m in modules]
                )
                group_name = student.group.name
            else:
                module_list = "No group assigned yet"
                group_name = "No group assigned"

            return (
                f"Student Name: {student.user.get_full_name() or student.user.username}\n"
                f"Username: {student.user.username}\n"
                f"Email: {student.user.email}\n"
                f"Semester: {student.semester}\n"
                f"Year: {student.year}\n"
                f"Group: {group_name}\n"
                f"Role: {student.get_role_display()}\n"
                f"Modules enrolled: {module_list}"
            )
        @tool
        def get_announcements(keyword: Optional[str]  = None) -> str:
            """
            Use this when student asks about:
            - any announcements or news
            - updates from admin or college
            - notices or notifications
            - recent announcements
            - announcements about a specific topic
            Use keyword if student asks about specific topic e.g 'exam', 'holiday'.
            Leave keyword empty to get latest announcements.
            """
            query = Announcement.objects.all()


            if keyword:
                query = query.filter(
                    Q(title__icontains=keyword) |
                    Q(description__icontains=keyword)
                )

         
            announcements = query[:5]

            if not announcements:
                if keyword:
                    return f"No announcements found about '{keyword}'."
                return "No announcements found."

            lines = []
            for announcement in announcements:
                lines.append(
                    f" {announcement.title}\n"
                    f"   {announcement.description}\n"
                    f"   Posted by: {announcement.created_by.get_full_name() or announcement.created_by.username}\n"
                    f"   Date: {announcement.upload_time.strftime('%B %d, %Y')}"
                )

            return "\n\n".join(lines)
                
        @tool
        def get_class_resources(
            module_name: Optional[str] = None,
            week: Optional[int] = None,
            session_type: Optional[str] = None,
            question: Optional[str] = None,
            specific: bool = False
        ) -> str:
            """
            Use this when a student asks about:
            - what was covered or taught in a class
            - what did we learn in week X of subject Y
            - summary of a lecture, tutorial, or workshop
            - study materials or resources for a subject
            - download links for class notes or slides
            - specific topic from a class e.g 'explain decision trees from week 3'
            Use module_name for the subject e.g 'AI', 'Math'.
            Use week for a specific week number e.g 3.
            Use session_type for 'lecture', 'tutorial', or 'workshop'.
            Use question to pass the student's exact question.
            Set specific=True if student is asking about a particular topic within the material.
            Set specific=False if student just wants a general summary of what was covered.

            IMPORTANT — understanding the returned content:
            The summary returned is a collection of short sentences extracted from different
            chunks of the document. They are NOT a flowing text — each sentence represents
            a different section of the material. Treat them as topic hints, synthesize them
            into a coherent answer, and never repeat them verbatim to the student.
            If specific=True, the chunk content returned is raw extracted text — use it
            carefully, focus on what is relevant to the student's question and ignore noise.
            """

            # Query the database
            query = Resource.objects.select_related('module').all()

            if module_name:
                query = query.filter(module__name__icontains=module_name)
            if week is not None:
                query = query.filter(week=week)
            if session_type:
                query = query.filter(type__icontains=session_type)

            if not query.exists():
                return "No resources found matching your query."

            rag_question = question or "What are the main topics covered in this material?"
            results = []

            for resource in query:
                result = query_resource(resource, rag_question)

                overall_summary = result["overall_summary"]
                chunk_content   = result["chunk_content"]
                metadata        = result["metadata"]


                content = chunk_content if specific else overall_summary
                content = truncate_text(content, max_chars=1500)

                results.append(
                    f"Title: {metadata.get('title', resource.title)}\n"
                    f"Module: {metadata.get('module')} ({metadata.get('module_code')})\n"
                    f"Type: {metadata.get('type', '').capitalize()} | Week: {metadata.get('week', 'N/A')}\n"
                    f"Download: http://localhost:8000/resources/download/{resource.file.name.split('/')[-1]}\n\n"
                    f"{'Relevant Content' if specific else 'Summary'}:\n{content}"
)

            return "\n\n---\n\n".join(results)
                           

            

       

        return [get_attendance_summary,
                get_schedule,
                get_student_info,
                get_announcements,
                get_class_resources,
                ]  

def build_agent(student):
    """
    Builds and returns the agent executor for a given student.
    Called once per API request.
    """

    llm = get_llm()

   
    tools = StudentTools(student).get_tools()

   
    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content=SYSTEM_PROMPT.format(
            today=timezone.localdate().strftime("%A, %B %d, %Y"),
            student_name=student.user.get_full_name() or student.user.username
        )),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])


    agent = create_tool_calling_agent(
        llm=llm,
        tools=tools,
        prompt=prompt
    )


    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,      
        max_iterations=10,  
        handle_parsing_errors=True  
    )

    return agent_executor