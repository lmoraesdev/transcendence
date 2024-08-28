from rest_framework.decorators import api_view
from rest_framework.response import Response
from .consumers import getAllRooms

@api_view(['GET'])
def listRooms(request):
    rooms = getAllRooms()
    return Response(rooms)