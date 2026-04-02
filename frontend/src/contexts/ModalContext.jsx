import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import styles from './ModalContext.module.css';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info', // info | success | error | warning | confirm
        onConfirm: null,
        onCancel: null
    });

    // ===== ALERT (auto close) =====
    const showAlert = useCallback((message, title = 'Thông báo', type = 'info') => {
        setModal({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: null,
            onCancel: null
        });
    }, []);

    // ===== CONFIRM =====
    const showConfirm = useCallback((message, onConfirm, onCancel = null, title = 'Xác nhận') => {
        setModal({
            isOpen: true,
            title,
            message,
            type: 'confirm',
            onConfirm,
            onCancel
        });
    }, []);

    // ===== AUTO CLOSE ALERT =====
    useEffect(() => {
        if (modal.isOpen && modal.type !== 'confirm') {
            const timer = setTimeout(() => {
                setModal(prev => ({ ...prev, isOpen: false }));
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [modal]);

    const handleConfirm = () => {
        modal.onConfirm && modal.onConfirm();
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        modal.onCancel && modal.onCancel();
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}

            {modal.isOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} ${styles[modal.type]}`}>

                        {/* HEADER */}
                        <div className={styles.modalHeader}>
                            <h3>{modal.title}</h3>
                        </div>

                        {/* BODY */}
                        <div className={styles.modalBody}>
                            <div className={styles.icon}>
                                {modal.type === 'success' && <i className="fas fa-check-circle"></i>}
                                {modal.type === 'error' && <i className="fas fa-times-circle"></i>}
                                {modal.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
                                {modal.type === 'info' && <i className="fas fa-info-circle"></i>}
                                {modal.type === 'confirm' && <i className="fas fa-question-circle"></i>}
                            </div>
                            <p>{modal.message}</p>
                        </div>

                        {/* FOOTER */}
                        {modal.type === 'confirm' && (
                            <div className={styles.modalFooter}>
                                <button className={styles.cancelBtn} onClick={handleCancel}>
                                    Hủy
                                </button>
                                <button className={styles.confirmBtn} onClick={handleConfirm}>
                                    Xác nhận
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within ModalProvider');
    return context;
};