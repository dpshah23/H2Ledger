from rest_framework import serializers
from auth1.models import User1
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  
    class Meta:
        model = User1
        fields = ("user_id", "wallet_address", "name", "email", "role", "password", "created_at")
        read_only_fields = ("user_id", "created_at")

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "password" in validated_data:
            validated_data["password"] = make_password(validated_data["password"])
        return super().update(instance, validated_data)

# User = get_user_model()

# class RegisterSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True)
#     role = serializers.ChoiceField(choices=User.ROLE_CHOICES)

#     class Meta:
#         model = User
#         fields = ("id", "username", "email", "password", "role")

#     def create(self, validated_data):
#         user = User(
#             username=validated_data["username"],
#             email=validated_data["email"],
#             role=validated_data["role"]
#         )
#         user.set_password(validated_data["password"])  
#         user.save()

#         UserProfile.objects.create(user=user)
#         return user

# class AuditLogSerializer(serializers.ModelSerializer):
#     user = serializers.CharField(source="user.username", read_only=True)

#     class Meta:
#         model = AuditLog
#         fields = ("id", "user", "action", "ip_address", "timestamp", "details")