import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ContactMessageForm from './ContactMessageForm';
import '../../styles/contact-modal.css';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

const ContactModal = ({ open, onClose }) => {
    const dialogRef = useRef(null);
    const previouslyFocusedRef = useRef(null);
    const onCloseRef = useRef(onClose);

    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return undefined;

        previouslyFocusedRef.current = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const focusTimer = window.setTimeout(() => {
            const firstField = dialogRef.current?.querySelector(
                '#contactModalForm input, #contactModalForm textarea, #contactModalForm select'
            );
            firstField?.focus({ preventScroll: true });
        }, 80);

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onCloseRef.current?.();
                return;
            }

            if (event.key !== 'Tab') return;

            const focusable = [...(dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || [])]
                .filter((element) => element.offsetParent !== null);

            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.clearTimeout(focusTimer);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocusedRef.current?.focus?.({ preventScroll: true });
        };
    }, [open]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {open ? (
                <motion.div
                    className="contact-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) onCloseRef.current?.();
                    }}
                >
                    <motion.div
                        ref={dialogRef}
                        className="contact-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="contact-modal-title"
                        initial={{ opacity: 0, y: 28, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.98 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <button
                            type="button"
                            className="contact-modal-close"
                            aria-label="Close contact form"
                            onClick={() => onCloseRef.current?.()}
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>

                        <div className="contact-modal-scroll">
                            <div className="contact-modal-head">
                                <p className="contact-badge">
                                    <span className="star-rotate" aria-hidden="true">&#9733;</span>
                                    Start A Conversation
                                </p>
                                <h2 id="contact-modal-title">Send Us A Message</h2>
                                <p className="contact-note">
                                    Share your requirement and our team will get back to you within 24 hours.
                                </p>
                            </div>

                            <ContactMessageForm formId="contactModalForm" idPrefix="contact-modal" />

                            <div className="contact-modal-foot">
                                <span>Prefer to talk directly?</span>
                                <a href="tel:+916380049042">+91 63800 49042</a>
                                <span aria-hidden="true">&middot;</span>
                                <a href="mailto:ethiroli.net@gmail.com">ethiroli.net@gmail.com</a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>,
        document.body
    );
};

export default ContactModal;
