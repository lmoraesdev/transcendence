from rest_framework import serializers
from .models import Player

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class PlayerInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = [
            "id",
            "email",
            "username",
            "firstName",
            "lastName",
            "avatar",
            "twoFactor",
            "status",
            "victory",
            "defeat",
        ]