from django.urls import path, include
from .views import login,signup, get_current_user

urlpatterns = [
   path('login/',login,name="login"),
   path('signup/',signup,name="signup"),
   path('register/',signup,name="register"),  # alias for signup
   path('user/',get_current_user,name="current_user"),
]
