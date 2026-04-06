import React from 'react';
import styles from './DesktopWarning.module.css';

/**
 * DesktopWarning Component
 * Shared component to show warning message on desktop devices
 * This application is designed for mobile devices only
 */
export const DesktopWarning = () => {
  return (
    <div className={styles.desktopWarning}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <i className="fas fa-mobile-alt"></i>
        </div>
        <h1>Vui lòng sử dụng thiết bị di động</h1>
        <p>
          Trang này được thiết kế dành riêng cho điện thoại để mang lại trải nghiệm tốt nhất.
          Vui lòng truy cập bằng smartphone hoặc tablet.
        </p>
        <div className={styles.qrCode}>
          <p>Quét mã QR để mở trên điện thoại:</p>
          <div className={styles.qrPlaceholder}>
            <i className="fas fa-qrcode"></i>
            <span>QR Code</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopWarning;
