import React, { useEffect, useState } from 'react';
import '../../styles/contact-form.css';
import '../../styles/contact-modal.css';

const initialForm = {
    fullName: '',
    email: '',
    phone: '',
    role: '',
    portfolioUrl: '',
    experienceLevel: 'Entry',
    message: '',
};

const ApplyModal = ({ open, role, onClose }) => {
    const [formData, setFormData] = useState({ ...initialForm, role: role || '' });
    const [submitState, setSubmitState] = useState({ loading: false, error: '', success: '' });

    useEffect(() => {
        if (open) {
            setFormData({ ...initialForm, role: role || '' });
            setSubmitState({ loading: false, error: '', success: '' });
        }
    }, [open, role]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitState({ loading: true, error: '', success: '' });
        try {
            const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
            const base = /\/api$/i.test(apiBase) ? apiBase : `${apiBase}/api`;
            const response = await fetch(`${base}/v1/candidates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.message || 'Failed to submit application.');
            setSubmitState({
                loading: false,
                error: '',
                success: 'Application submitted successfully. Our team will review your profile and contact you soon.',
            });
        } catch (error) {
            setSubmitState({
                loading: false,
                error: error.message || 'Something went wrong. Please try again.',
                success: '',
            });
        }
    };

    const resetForm = () => {
        setFormData({ ...initialForm, role: role || '' });
        setSubmitState({ loading: false, error: '', success: '' });
    };

    if (!open) return null;

    return (
        <div className="contact-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="contact-modal-close" onClick={onClose} aria-label="Close apply form">&times;</button>
                <div className="contact-modal-scroll">
                    {submitState.success ? (
                        <div className="contact-success-panel" role="status" aria-live="polite">
                            <div className="contact-success-icon" aria-hidden="true">
                                <i className="fa-solid fa-check"></i>
                            </div>
                            <h2 className="contact-success-title" tabIndex={-1}>Application Received</h2>
                            <p className="contact-success-greeting">
                                Thank you{formData.fullName ? `, ${formData.fullName.split(' ')[0]}` : ''}!
                            </p>
                            <p className="contact-success-copy">{submitState.success}</p>
                            <div className="contact-success-actions">
                                <button type="button" className="btn contact-submit-btn" onClick={resetForm}>
                                    Submit Another Application
                                </button>
                                <button type="button" className="btn contact-submit-btn contact-submit-btn--ghost" onClick={onClose}>
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="contact-modal-head">
                                <h2>Apply To Ethiroli</h2>
                                <p className="contact-note">Fill the form below and submit your details. We review every application carefully.</p>
                            </div>
                            <form className="contact-form-grid" onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Full Name *"
                                    required
                                    maxLength={200}
                                    aria-label="Full Name"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email *"
                                    required
                                    maxLength={255}
                                    pattern="[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}"
                                    title="Enter a valid email address, for example name@gmail.com"
                                    aria-label="Email Address"
                                />
                                <input
                                    type="tel"
                                    inputMode="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Phone Number"
                                    maxLength={10}
                                    pattern="[0-9]{10}"
                                    title="Enter exactly 10 digits"
                                    aria-label="Phone Number"
                                />
                                <input
                                    type="text"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    placeholder="Role *"
                                    required
                                    maxLength={255}
                                    aria-label="Role"
                                />
                                <input
                                    type="url"
                                    name="portfolioUrl"
                                    value={formData.portfolioUrl}
                                    onChange={handleChange}
                                    placeholder="Portfolio / Resume URL"
                                    maxLength={500}
                                    aria-label="Portfolio URL"
                                />
                                <select
                                    name="experienceLevel"
                                    value={formData.experienceLevel}
                                    onChange={handleChange}
                                    className="contact-select"
                                    aria-label="Experience level"
                                >
                                    <option value="Entry">Entry</option>
                                    <option value="Junior">Junior</option>
                                    <option value="Mid">Mid</option>
                                    <option value="Senior">Senior</option>
                                </select>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Message"
                                    maxLength={5000}
                                    aria-label="Message"
                                ></textarea>
                                <div className="contact-form-actions">
                                    <button type="submit" className="btn contact-submit-btn" disabled={submitState.loading}>
                                        {submitState.loading ? 'Submitting...' : 'Apply'}
                                    </button>
                                </div>
                                <div className="contact-form-status" aria-live="polite">
                                    {submitState.error ? <p className="contact-feedback error" role="alert">{submitState.error}</p> : null}
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplyModal;
