from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from decouple import config
from django.views.generic import TemplateView
from .services import OAuthCallback, OAuthLogin

BASE_URL = config('BASE_URL')

class HomeView(TemplateView):
    template_name = "index.html"
