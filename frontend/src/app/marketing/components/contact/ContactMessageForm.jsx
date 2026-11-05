import React, { useEffect, useRef, useState } from 'react';
import '../../styles/contact-form.css';

const EMPTY_FORM = {
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
    enquiry_type: 'General',
    meeting_preference: '',
};

const CONTACT_EMAIL = 'ethiroli.net@gmail.com';
const CONTACT_PHONE = '+91 63800 49042';

// Resolve the API root for every environment:
// - dev: proxy through Vite (/api -> backend)
// - production: same-origin /api behind nginx
// - explicit VITE_API_BASE_URL (with or without a trailing /api)
const resolveContactEndpoint = () => {
    const rawBase = (import.meta.env.VITE_API_BASE_URL || '/api').trim().replace(/\/+$/, '');
    const apiBase = /\/api$/i.test(rawBase) ? rawBase : `${rawBase}/api`;
    return `${apiBase}/v1/contact-messages`;
};

const ContactMessageForm = ({ formId = 'contactForm', idPrefix = 'contact', onSuccess }) => {
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [submitState, setSubmitState] = useState({
        loading: false,
        error: '',
        success: null,
    });
    const successHeadingRef = useRef(null);

    useEffect(() => {
        if (submitState.success) {
            successHeadingRef.current?.focus({ preventScroll: true });
        }
    }, [submitState.success]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        let nextValue = value;
        if (name === 'phone') {
            // Phone numbers may contain digits, spaces, +, -, and parentheses only.
            nextValue = value.replace(/[^0-9]/g, '').slice(0, 10);
        }
        setFormData((prev) => {
            const next = { ...prev, [name]: nextValue };
            if (name === 'enquiry_type' && nextValue !== 'Meeting') {
                next.meeting_preference = '';
            }
            return next;
        });
        setSubmitState((prev) => (
            prev.error || prev.success
                ? { ...prev, error: '', success: null }
                : prev
        ));
    };

    const handleSendAnother = () => {
        setFormData({ ...EMPTY_FORM });
        setSubmitState({ loading: false, error: '', success: null });
        // The form is rendered again on the next paint; focus its first field
        // so keyboard users land exactly where they expect to start over.
        window.setTimeout(() => {
            document.getElementById(`${idPrefix}-name`)?.focus({ preventScroll: true });
        }, 0);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitState.loading) return;

        const payload = {
            ...formData,
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            subject: formData.subject.trim(),
            message: formData.message.trim(),
        };

        if (!payload.name || !payload.phone || !payload.email || !payload.subject || !payload.message) {
            setSubmitState({ loading: false, error: 'Please fill in all required fields.', success: null });
            return;
        }

        setSubmitState({ loading: true, error: '', success: null });

        try {
            const response = await fetch(resolveContactEndpoint(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ ...payload, source: 'website_contact' }),
            });

            const responseText = await response.text();
            let body = {};
            if (responseText) {
                try {
                    body = JSON.parse(responseText);
                } catch {
                    body = {};
                }
            }

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error(body.message || 'Too many messages from this connection. Please try again in a little while.');
                }
                if (response.status >= 500) {
                    throw new Error(`We could not send your message right now. Please try again in a moment or email us at ${CONTACT_EMAIL}.`);
                }
                throw new Error(body.message || 'We could not send your message. Please check your details and try again.');
            }

            // success() wraps its payload in `data`, so the duplicate flag and
            // reference live there rather than at the top level of the body.
            const result = body?.data && typeof body.data === 'object' ? body.data : {};
            setFormData({ ...EMPTY_FORM });
            setSubmitState({
                loading: false,
                error: '',
                success: {
                    duplicate: Boolean(result.duplicate),
                    firstName: payload.name.split(/\s+/)[0] || '',
                },
            });
            onSuccess?.(body);
        } catch (error) {
            const message = error?.message === 'Failed to fetch' || error instanceof TypeError
                ? `We could not reach the server. Please check your connection or email us at ${CONTACT_EMAIL}.`
                : (error.message || 'Something went wrong. Please try again.');
            setSubmitState({ loading: false, error: message, success: null });
        }
    };

    if (submitState.success) {
        const { duplicate, firstName } = submitState.success;
        const greeting = firstName ? `Thank you, ${firstName}.` : 'Thank you.';
        return (
            <div className="contact-success-panel" role="status" aria-live="polite">
                <span className="contact-success-icon" aria-hidden="true">&#10003;</span>
                <h3
                    className="contact-success-title"
                    id={`${idPrefix}-success-title`}
                    ref={successHeadingRef}
                    tabIndex={-1}
                >
                    {duplicate ? 'Your message is already with us' : 'Message sent successfully!'}
                </h3>
                <p className="contact-success-greeting">{greeting}</p>
                <p className="contact-success-copy">
                    {duplicate
                        ? 'We received this enquiry a moment ago, so there is no need to send it again. Our HR team will get back to you within 24 hours.'
                        : 'Your message has reached the Ethiroli HR team. We will review it and get back to you within 24 hours.'}
                </p>
                <div className="contact-success-actions">
                    <button type="button" className="btn contact-submit-btn" onClick={handleSendAnother}>
                        Send another message
                    </button>
                </div>
                <p className="contact-success-alt">
                    Need a faster reply? Call <a href="tel:+916380049042">{CONTACT_PHONE}</a> or email{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                </p>
            </div>
        );
    }

    return (
        <form className="contact-form-grid" id={formId} onSubmit={handleSubmit} autoComplete="on" noValidate={false}>
            <input
                type="text"
                id={`${idPrefix}-name`}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name *"
                required
                maxLength={200}
                aria-label="Your Name"
                autoComplete="name"
            />
            <input
                type="tel"
                inputMode="tel"
                id={`${idPrefix}-phone`}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number *"
                required
                maxLength={10}
                pattern="[0-9]{10}"
                aria-label="Phone Number"
                autoComplete="tel"
            />
            <input
                type="email"
                id={`${idPrefix}-email`}
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email *"
                required
                maxLength={255}
                pattern="[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"
                aria-label="Email Address"
                autoComplete="email"
            />
            <input
                type="text"
                id={`${idPrefix}-subject`}
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject *"
                required
                maxLength={255}
                aria-label="Subject"
                autoComplete="off"
            />
            <select
                id={`${idPrefix}-enquiry-type`}
                name="enquiry_type"
                value={formData.enquiry_type}
                onChange={handleChange}
                aria-label="Enquiry type"
                className="contact-select"
            >
                <option value="General">General enquiry</option>
                <option value="Services">Services</option>
                <option value="Careers">Careers</option>
                <option value="Internship">Internship</option>
                <option value="Meeting">Request a meeting</option>
            </select>
            {formData.enquiry_type === 'Meeting' && (
                <input
                    id={`${idPrefix}-meeting-preference`}
                    name="meeting_preference"
                    type="datetime-local"
                    value={formData.meeting_preference}
                    onChange={handleChange}
                    aria-label="Preferred meeting date and time (optional)"
                    className="contact-field--full"
                />
            )}
            <textarea
                id={`${idPrefix}-message`}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                required
                maxLength={10000}
                aria-label="Message"
                autoComplete="off"
            ></textarea>
            <div className="contact-form-actions">
                <button type="submit" className="btn contact-submit-btn" disabled={submitState.loading}>
                    {submitState.loading ? 'Sending...' : 'Send Message'}
                </button>
                <p className="contact-privacy">
                    By sending this message you agree to be contacted about your enquiry. We never share your details.
                </p>
            </div>
            <div className="contact-form-status" aria-live="polite">
                {submitState.error ? <p className="contact-feedback error" role="alert">{submitState.error}</p> : null}
            </div>
        </form>
    );
};

export default ContactMessageForm;
