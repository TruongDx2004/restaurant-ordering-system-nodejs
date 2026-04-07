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
            const data = response.data || [];
            setNotifications(data);
            
            const countResponse = await notificationApi.getUnreadCount(recipientType, recipientId);
            setUnreadCount(countResponse.data || 0);
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

        const unsubscribeGlobal = webSocketService.subscribe('/topic/notifications', (msg) => {
            console.log('[Notification] Received global notification:', msg);
            const normalizedNotif = {
                id: msg.data?.id || Date.now(),
                title: msg.data?.title || msg.type,
                message: msg.message,
                type: msg.type,
                data: msg.data,
                isRead: false,
                createdAt: msg.timestamp || new Date().toISOString()
            };
            handleNewNotification(normalizedNotif);
        });

        return () => {
            unsubscribeGlobal();
        };
    }, [recipientType, recipientId, fetchNotifications]);

    const handleNewNotification = (notif) => {
        setNotifications(prev => {
            if (prev.some(n => n.id === notif.id)) return prev;
            return [notif, ...prev];
        });
        setUnreadCount(prev => prev + 1);
        
        if (Notification.permission === 'granted') {
            new Notification(notif.title, { body: notif.message });
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationApi.markAsRead(id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead(recipientType, recipientId);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
            if (notificationToDelete && !notificationToDelete.isRead) {
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
