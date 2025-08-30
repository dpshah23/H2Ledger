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
    # print(token)
    return token

@api_view(['POST'])
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
            print(user)
        except User1.DoesNotExist:
            print("Doesn't exist")
            return Response({"message": "Login failed"}, status=400)

        if user.check_password(password):
            
            #JWT Token
            print("Password true")
            token = create_jwt_token(user)
            return Response({"token": token,"role": user.role,"email": user.email,"wallet_id": user.wallet_address}, status=200)

    return Response({"message": "Login failed"}, status=400)


@api_view(['POST'])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Create JWT token for the new user
        token = create_jwt_token(user)
        
        # Format user data for frontend compatibility
        user_data = {
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "wallet_address": user.wallet_address
        }
        
        # Return consistent format with login
        return Response({
            "token": token,
            "user": user_data
        }, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current authenticated user details.
    """
    try:
        # Extract user_id from JWT token in request headers
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({"message": "No valid token provided"}, status=401)
        
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get('user_id')
        
        user = User1.objects.get(user_id=user_id)
        user_data = {
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "wallet_address": user.wallet_address
        }
        
        return Response(user_data, status=200)
        
    except jwt.ExpiredSignatureError:
        return Response({"message": "Token has expired"}, status=401)
    except jwt.InvalidTokenError:
        return Response({"message": "Invalid token"}, status=401)
    except User1.DoesNotExist:
        return Response({"message": "User not found"}, status=404)
    except Exception as e:
        return Response({"message": "Authentication failed"}, status=401)