from django.db import models
from django.contrib.auth.hashers import make_password,check_password

class User1(models.Model):
    ROLE_CHOICES = (
        ('producer', 'Producer'),
        ('buyer', 'Buyer'),
        ('regulator', 'Regulator'),
        ('verifier', 'Verifier')
    )

    user_id = models.AutoField(primary_key=True)
    wallet_address = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    password = models.CharField(max_length=128) 
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.password.startswith("pbkdf2_sha256$"):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def check_password(self, password):
        return self.password == make_password(password)

    def __str__(self):
        return f"{self.name} ({self.role})"


# class User(AbstractUser):
#     ROLE_CHOICES = (
#         ("producer", "Producer"),
#         ("buyer", "Buyer"),
#         ("verifier", "Verifier"),
#     )
    
#     role = models.CharField(max_length=20, choices=ROLE_CHOICES)
#     public_key = models.TextField(blank=True, null=True)
#     private_key = models.TextField(blank=True, null=True) 
    
#     def __str__(self):
#         return f"{self.username} ({self.role})"
    
# class UserProfile(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
#     organization = models.CharField(max_length=100, blank=True, null=True)
#     country = models.CharField(max_length=100, blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Profile of {self.user.username}"
    
# class AuditLog(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     action = models.CharField(max_length=100)   # e.g., "Login", "Issue Credit", "Retire Credit"
#     ip_address = models.GenericIPAddressField(null=True, blank=True)
#     timestamp = models.DateTimeField(auto_now_add=True)
#     details = models.JSONField(blank=True, null=True)

#     def __str__(self):
#         return f"{self.user.username} - {self.action} at {self.timestamp}"