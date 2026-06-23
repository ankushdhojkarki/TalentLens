from django.shortcuts import render
from django.http import JsonResponse

def index(request):
    return render(request, 'talentlens/index.html')

def analyze(request):
    if request.method == 'POST':
        return JsonResponse({'message': 'working'})
    return render(request, 'talentlens/index.html')