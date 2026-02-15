from django.shortcuts import render

import os
import cv2
import numpy as np
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from facial_recognition.utils import init_face_model, get_face_embedding
from facial_recognition.pinecone_utils import init_pinecone_index, find_best_match, store_embedding
from dotenv import load_dotenv
from rest_framework.decorators import api_view

from rest_framework_simplejwt.tokens import RefreshToken

load_dotenv("../.env")
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def face_login(request):
    model = init_face_model()
    api_key = os.environ.get("PINECONE_API_KEY")
    index = init_pinecone_index(api_key)

    try:
        User = get_user_model()

        if request.method != "POST":
            return JsonResponse({"success": False, "message": "POST request required."}, status=400)

        if "image" not in request.FILES:
            return JsonResponse({"success": False, "message": "No image uploaded."}, status=400)

        uploaded_file = request.FILES["image"]
        np_img = np.frombuffer(uploaded_file.read(), np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        embedding = get_face_embedding(img)
        if embedding is None:
            return JsonResponse({"success": False, "message": "No face detected."}, status=400)

        matched, user_id_str, score = find_best_match(index, embedding)
        
        if not matched:
            return JsonResponse({"success": False, "message": "Face not recognized."})
        
        print("Match found:", matched)
        print("Matched ID:", user_id_str)
        print("Similarity score:", score)

        try:
            user_id = int(user_id_str)
        except ValueError:
            return JsonResponse({"success": False, "message": f"Invalid user ID from Pinecone: {user_id_str}"}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"success": False, "message": "User not found"}, status=404)

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        if user.is_superuser == True:
            role = 'teacher'
        else:
            role = 'student'


        response = JsonResponse({
            "success": True,
            "access": str(access),
            "username": user.username,
            "role": role
        })

        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,      
            samesite="Lax",
            max_age=7 * 24 * 60 * 60  # 7 days
        )

        return response

    except Exception as e:
        # Catch all unexpected errors and return JSON
        return JsonResponse({"success": False, "message": f"Unexpected error: {str(e)}"}, status=500)


@api_view(["POST"])
def face_register(request):
    try:
        user = request.user  # logged-in student
        print("Face register request user:", user)
   
        if "image" not in request.FILES:
            return JsonResponse(
                {"success": False, "message": "No image provided"},
                status=400
            )

        image_file = request.FILES["image"]

        # Convert image to OpenCV format
        img = np.frombuffer(image_file.read(), np.uint8)
        frame = cv2.imdecode(img, cv2.IMREAD_COLOR)

        if frame is None:
            return JsonResponse(
                {"success": False, "message": "Invalid image"},
                status=400
            )

        # Extract face embedding
        embedding = get_face_embedding(frame)

        if embedding is None:
            return JsonResponse(
                {"success": False, "message": "No face detected"},
                status=400
            )

        # Store in Pinecone
        store_embedding(user.id, embedding)

        return JsonResponse({
            "success": True,
            "message": "Face registered successfully"
        })

    except Exception as e:
        return JsonResponse(
            {"success": False, "error": str(e)},
            status=500
        )

