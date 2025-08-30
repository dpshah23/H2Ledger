from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import User1
from django.conf import settings
import jwt
import os
from dotenv import load_dotenv
from .serializers import UserSerializer

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")


def create_jwt_token(user):
    payload = {
        "user_id": user.user_id,
        "email": user.email,
        "role": user.role
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

@api_view(['POST','GET'])
def login(request):
    """
    User login view.
    """
    if request.method == "POST":
        # Handle login logic here
        password=request.data.get("password")
        email=request.data.get("email")

        if not email or not password:
            return Response({"message": "Email and password are required"}, status=400)

        try:
            user = User1.objects.get(email=email)
        except User1.DoesNotExist:
            return Response({"message": "Login failed"}, status=400)

        if user.check_password(password):
            
            #JWT Token
            token = create_jwt_token(user)
            return Response({"token": token}, status=200)

    return Response({"message": "Login failed"}, status=400)


@api_view(['POST','GET'])
def signup(request):

    if request.method == "POST":

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message":True,"user":user})

    return Response({"message": "Signup failed"}, status=400)