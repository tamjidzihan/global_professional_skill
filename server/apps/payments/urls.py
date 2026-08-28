from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, PromoCodeViewSet


router = DefaultRouter()
router.register(r"payments", PaymentViewSet, basename="payments")
router.register(r"promo-codes", PromoCodeViewSet, basename="promo-codes")

urlpatterns = [
    path("", include(router.urls)),
]

