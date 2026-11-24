import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/shared/SEO';
import PageHero from '../components/shared/PageHero';

const fadeIn = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const sections = [
    {
        id: 'introduction',
        title: 'Introduction',
        body: 'At Ethiroli, we are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services. By engaging with us, you agree to the practices described in this policy.',
    },
    {
        id: 'information-we-collect',
        title: 'Information We Collect',
        body: 'We may collect personal information such as your name, email address, phone number, company details, and any other information you voluntarily provide when filling out forms, subscribing to newsletters, or contacting us. We also collect non-personal data such as browser type, IP address, and usage statistics.',
    },
    {
        id: 'how-we-use-information',
        title: 'How We Use Information',
        body: 'We use the information we collect to deliver and improve our services, respond to your inquiries, send relevant updates, and personalize your experience. We do not sell or rent your personal data to third parties. Processing is based on your consent or our legitimate business interests.',
    },
    {
        id: 'data-sharing',
        title: 'Data Sharing',
        body: 'We may share your information with trusted service providers who assist us in operating our business, subject to strict confidentiality obligations. We may also disclose information when required by law, regulation, or legal process. Aggregate, anonymized data may be used for analytics purposes.',
    },
    {
        id: 'data-security',
        title: 'Data Security',
        body: 'We implement industry-standard security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. While we strive to safeguard your information, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.',
    },
    {
        id: 'your-rights',
        title: 'Your Rights',
        body: 'You have the right to access, update, or delete the personal information we hold about you. You may also object to certain processing activities or request data portability. To exercise these rights, please contact us using the details provided below.',
    },
    {
        id: 'contact-us',
        title: 'Contact Us',
        body: 'If you have any questions or concerns about this Privacy Policy, please reach out to us at ethiroli.net@gmail.com or call +91 63800 49042. We are located at 1st Floor Gopala Krishnan complex guagi, Salem, India 636005.',
    },
];

const PrivacyPolicy = () => {
    return (
        <div className="legal-page">
            <SEO
                title="Privacy Policy — Ethiroli Branding & Marketing Agency"
                description="Read the Privacy Policy for Ethiroli Branding & Marketing Agency. Learn how we collect, protect, and handle your data on ethiroli.net."
                canonical="https://ethiroli.net/privacy-policy"
                keywords="privacy policy, ethiroli privacy, data protection, branding agency terms"
            />
            <PageHero
                eyebrow="Legal & Privacy"
                title="Privacy Policy"
                subtitle="Your trust matters. Learn how we collect, use, and protect your personal information."
            />

            <div className="legal-shell">
                <div className="legal-layout">
                    <aside className="legal-toc" aria-label="On this page">
                        <div className="legal-toc-card">
                            <p className="legal-toc-title">On this page</p>
                            <ol>
                                {sections.map((section) => (
                                    <li key={section.id}>
                                        <a href={`#${section.id}`}>{section.title}</a>
                                    </li>
                                ))}
                            </ol>
                            <a className="legal-toc-help" href="mailto:ethiroli.net@gmail.com">
                                <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                                Questions? Email us
                            </a>
                        </div>
                    </aside>

                    <div className="legal-main">
                        <p className="legal-intro">
                            This policy applies to the ethiroli.net website and all services provided by Ethiroli Branding &amp; Marketing Agency. Please read it carefully.
                        </p>
                        {sections.map((section, index) => (
                            <motion.section
                                key={section.id}
                                id={section.id}
                                className="legal-section"
                                variants={fadeIn}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-40px' }}
                            >
                                <span className="legal-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                                <h2>{section.title}</h2>
                                <p>{section.body}</p>
                            </motion.section>
                        ))}

                        <div className="legal-cta">
                            <div>
                                <h2>Still have questions?</h2>
                                <p>Our team is happy to clarify anything about how we handle your data.</p>
                            </div>
                            <div className="legal-cta-actions">
                                <Link to="/contact_us" className="btn">Contact Us</Link>
                                <a href="tel:+916380049042" className="legal-cta-phone">
                                    <i className="fa-solid fa-phone" aria-hidden="true"></i> +91 63800 49042
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
