from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    
    path('events/', views.EventListView.as_view(), name='event-list'),
    path('events/<int:pk>/', views.EventDetailView.as_view(), name='event-detail'),
    path('events/<int:event_id>/start/', views.StartEventView.as_view(), name='start-event'),
    path('events/<int:event_id>/submit-quiz/', views.SubmitQuizView.as_view(), name='submit-quiz'),
    path('events/<int:event_id>/feedback/', views.FeedbackView.as_view(), name='submit-feedback'),
    
    path('analytics/', views.ManagerAnalyticsView.as_view(), name='manager-analytics'),
    path('analytics/<int:event_id>/', views.ManagerAnalyticsView.as_view(), name='event-analytics'),
    
    # Мерч
    path('merchandise/', views.MerchandiseListView.as_view(), name='merchandise-list'),
    path('merchandise/<int:pk>/', views.MerchandiseDetailView.as_view(), name='merchandise-detail'),
    path('merchandise/<int:merch_id>/purchase/', views.PurchaseMerchView.as_view(), name='purchase-merch'),
    path('orders/', views.MerchOrderListView.as_view(), name='merch-orders-list'),
    path('orders/<int:pk>/', views.MerchOrderDetailView.as_view(), name='merch-order-detail'),
    
    # Обратная связь
    path('completed-events/', views.CompletedEventsView.as_view(), name='completed-events'),
    path('my-feedbacks/', views.MyFeedbacksView.as_view(), name='my-feedbacks'),
]