from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Job, JobApplication
from .serializers import JobSerializer, JobApplicationSerializer

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['job_type', 'is_active', 'location']
    search_fields = ['title', 'description', 'requirements']
    ordering_fields = ['created_at', 'closing_date']

    def get_queryset(self):
        if self.request.user.is_staff:
            return Job.objects.all()
        return Job.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['job', 'status']

    def get_queryset(self):
        if self.request.user.is_staff:
            return JobApplication.objects.all()
        return JobApplication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def update_status(self, request, pk=None):
        application = self.get_object()
        new_status = request.data.get('status')
        if new_status in [s[0] for s in JobApplication.status.field.choices]:
            application.status = new_status
            application.save()
            return Response({'status': 'status updated'})
        return Response({'error': 'invalid status'}, status=status.HTTP_400_BAD_REQUEST)
