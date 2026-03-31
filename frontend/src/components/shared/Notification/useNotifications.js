import { useState, useEffect, useCallback } from 'react';
import notificationApi from '../../../api/notificationApi';
import webSocketService from '../../../services/webSocketService';

const useNotifications = (recipientType, recipientId) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async () => {
        if (!recipientType || !recipientId) return;
        
        setLoading(true);
        try {
            const response = await notificationApi.getByRecipient(recipientType, recipientId);
            setNotifications(response.data.data || []);
            
            const countResponse = await notificationApi.getUnreadCount(recipientType, recipientId);
            setUnreadCount(countResponse.data.data || 0);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [recipientType, recipientId]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!recipientType || !recipientId) return;

        // Subscribe to notifications via WebSocket
        const topic = recipientType === 'USER' 
            ? '/queue/notifications' 
            : `/topic/notifications/${recipientId}`;
            
        const unsubscribe = webSocketService.subscribe(topic, (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Play a sound or show a toast if needed
            if (Notification.permission === 'granted') {
                new Notification(newNotification.title, {
                    body: newNotification.message,
                });
            }
        });

        return () => {
            unsubscribe();
        };
    }, [recipientType, recipientId, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead(recipientType, recipientId);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const notificationToDelete = notifications.find(n => n.id === id);
            await notificationApi.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (notificationToDelete && !notificationToDelete.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: fetchNotifications
    };
};

export default useNotifications;
