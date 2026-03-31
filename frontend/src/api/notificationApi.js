import axiosInstance from './axiosConfig';
import { NOTIFICATION_ENDPOINTS } from '../constants/apiEndpoints';

const notificationApi = {
    getAll: () => axiosInstance.get(NOTIFICATION_ENDPOINTS.GET_ALL),
    
    getById: (id) => axiosInstance.get(NOTIFICATION_ENDPOINTS.GET_BY_ID(id)),
    
    getByRecipient: (recipientType, recipientId) => 
        axiosInstance.get(NOTIFICATION_ENDPOINTS.GET_ORDERED_BY_RECIPIENT, {
            params: { recipientType, recipientId }
        }),
        
    getUnreadCount: (recipientType, recipientId) =>
        axiosInstance.get(NOTIFICATION_ENDPOINTS.GET_UNREAD_COUNT, {
            params: { recipientType, recipientId }
        }),
        
    markAsRead: (id) => axiosInstance.patch(NOTIFICATION_ENDPOINTS.MARK_AS_READ(id)),
    
    markAllAsRead: (recipientType, recipientId) =>
        axiosInstance.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_AS_READ, {
            recipientType, recipientId
        }),
        
    delete: (id) => axiosInstance.delete(NOTIFICATION_ENDPOINTS.DELETE(id)),
    
    send: (data) => axiosInstance.post(NOTIFICATION_ENDPOINTS.SEND, data)
};

export default notificationApi;
