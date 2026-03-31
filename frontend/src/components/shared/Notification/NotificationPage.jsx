import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdminAuth } from '../../../contexts/admin/AdminAuthContext';
import { NotificationList } from '../../../components/shared/Notification';
import styles from './NotificationPage.module.css';

const NotificationPage = ({ role = 'CUSTOMER' }) => {
    const customerAuth = useAuth();
    const adminAuth = useAdminAuth();

    const user = role === 'CUSTOMER' ? customerAuth.user : adminAuth.user;
    const recipientType = role === 'CUSTOMER' ? 'CUSTOMER' : 'USER';

    if (!user) {
        return <div className={styles.error}>Vui lòng đăng nhập để xem thông báo.</div>;
    }

    return (
        <div className={styles.pageWrapper}>
            <NotificationList 
                recipientType={recipientType} 
                recipientId={user.id} 
            />
        </div>
    );
};

export default NotificationPage;
