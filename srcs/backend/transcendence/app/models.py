from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    def createUser(self, email, password=None, **extraFields):
        if not email:
            raise ValueError(_('The email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extraFields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class UserModel(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_('email address'), unique=True)
    userName = models.CharField(max_length=50, blank=True)
    firstName = models.CharField(max_length=50, blank=True)
    lastName = models.CharField(max_length=50, blank=True)
    isActive = models.BooleanField(default=True)
    isOnline = models.BooleanField(default=False)
    lastConnection = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUERIMENTS_FIELDS = []

    def __str__(self):
        return self.email
    
