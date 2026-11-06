import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import SEO from '../components/shared/SEO';
import ContactMessageForm from '../components/contact/ContactMessageForm';
import ContactModal from '../components/contact/ContactModal';
import '../styles/contact-page.css';

const Contact = () => {
    const [isConversationOpen, setIsConversationOpen] = useState(false);
    const location = useLocation();

    const openConversation = useCallback(() => setIsConversationOpen(true), []);
    const closeConversation = useCallback(() => setIsConversationOpen(false), []);

    // Keep the site header solid dark green on the contact page instead of
    // the default transparent-to-glass transition.
    useEffect(() => {
        document.body.classList.add('contact-page-active');
        return () => document.body.classList.remove('contact-page-active');
    }, []);

    // Deep links such as /contact_us#faq arrive after the lazy page has
    // rendered, so the browser's native anchor jump happens too early.
    useEffect(() => {
        if (!location.hash) return undefined;

        const targetId = decodeURIComponent(location.hash.slice(1));
        const timer = window.setTimeout(() => {
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 350);

        return () => window.clearTimeout(timer);
    }, [location.hash]);

    return (
        <div className="contact-page">
            <SEO
                title="Contact Us — Ethiroli Branding & Marketing Agency"
                description="Get in touch with Ethiroli, premier branding, performance marketing, and marketing automation agency in Salem, Tamil Nadu. Reach out for brand strategy and campaigns."
                canonical="https://ethiroli.net/contact_us"
                keywords="contact ethiroli, branding agency contact, marketing agency salem, ethiroli phone number, ethiroli address, ethiroli.net"
            />
            <section className="contact-hero">
                <div className="contact-hero-content">
                    <motion.span
                        className="contact-hero-badge"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <i className="fa-solid fa-sparkles"></i> Let's Connect
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Contact Us
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Let us collaborate to create meaningful impact together.
                    </motion.p>
                </div>
            </section>

            <section className="contact-info-section">
                <div className="contact-info-grid">
                    <motion.div className="contact-info-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                        <div className="icon"><i className="fa-regular fa-envelope"></i></div>
                        <h3>Email</h3>
                        <a href="mailto:ethiroli.net@gmail.com">ethiroli.net@gmail.com</a>
                    </motion.div>
                    <motion.div className="contact-info-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}>
                        <div className="icon"><i className="fa-solid fa-phone"></i></div>
                        <h3>Phone</h3>
                        <a href="tel:+916380049042">+91 63800 49042</a>
                        <a href="tel:+919789547065">+91 97895 47065</a>
                    </motion.div>
                    <motion.div className="contact-info-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }}>
                        <div className="icon"><i className="fa-solid fa-location-dot"></i></div>
                        <h3>Address</h3>
                        <p>1st Floor, Gopala Krishnan Complex, Gugai, Salem, Tamil Nadu 636006</p>
                    </motion.div>
                    <motion.div className="contact-info-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.3 }}>
                        <div className="icon"><i className="fa-regular fa-clock"></i></div>
                        <h3>Working Hours</h3>
                        <p>Mon - Sat, 9:00 AM - 6:30 PM</p>
                    </motion.div>
                </div>
            </section>

            <section className="contact-premium" id="contactFormSection">
                <motion.div
                    className="contact-panel contact-panel-form"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="contact-badge"><span className="star-rotate">&#9733;</span>Start A Conversation</p>
                    <h2>Send Us A Message</h2>
                    <p className="contact-note">Share your requirement and our team will get back to you within 24 hours.</p>
                    <ContactMessageForm formId="contactForm" idPrefix="contact-page" />
                </motion.div>

                <motion.div
                    className="contact-panel contact-panel-info"
                    id="contact"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="contact-badge"><span className="star-rotate">&#9733;</span> Reach Us</p>
                    <div>
                        <h2>We are here to support your vision with strategy, creativity, and execution.</h2>
                        <p className="contact-note">Prefer direct communication? Use any of the channels below.</p>
                    </div>
                    <div className="contact-channel-list">
                        <a href="mailto:ethiroli.net@gmail.com">
                            <i className="fa-regular fa-envelope"></i>
                            ethiroli.net@gmail.com
                        </a>
                        <a href="tel:+916380049042">
                            <i className="fa-solid fa-phone"></i>
                            +91 63800 49042
                        </a>
                        <a href="tel:+919789547065">
                            <i className="fa-solid fa-phone"></i>
                            +91 97895 47065
                        </a>
                        <a
                            href="https://www.google.com/maps/search/?api=1&query=Gopala+Krishnan+Complex,+Gugai,+Salem,+Tamil+Nadu+636006"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="fa-solid fa-location-dot"></i>
                            1st Floor, Gopala Krishnan Complex, Gugai, Salem, Tamil Nadu 636006
                        </a>
                    </div>
                    <a className="btn" href="#faq">Read FAQs</a>
                </motion.div>
            </section>

            <section id="faq" className="et-faq-section">
                <div className="et-faq-body">
                    <div className="et-faq-header">
                        <h3 className="et-faq-title">Frequently Asked Questions</h3>
                        <div className="et-faq-seperator"></div>
                    </div>

                    <div className="et-faq-list">
                        <div>
                            <details>
                                <summary title="What services does Ethiroli offer?">What services does Ethiroli offer?</summary>
                                <p className="et-faq-content">
                                    Ethiroli is a premier branding and marketing agency in Tamil Nadu offering brand strategy, visual identity design, performance marketing, marketing automation, SEO/AEO/GEO optimization, and high-converting lead generation.
                                </p>
                            </details>
                        </div>
                        <div>
                            <details>
                                <summary title="Do you provide marketing automation and digital presence services?">Do you provide marketing automation and digital presence services?</summary>
                                <p className="et-faq-content">
                                    Yes. We design and build high-converting brand landing pages, automated lead capture funnels, and CRM workflow integrations focused on user experience, fast performance, and customer conversion.
                                </p>
                            </details>
                        </div>
                        <div>
                            <details>
                                <summary title="How does Ethiroli generate leads for businesses?">How does Ethiroli generate leads for businesses?</summary>
                                <p className="et-faq-content">
                                    We deploy data-driven performance marketing strategies including multi-channel paid ads, automated marketing funnels, landing page optimization, and analytics tracking to generate high-intent leads and measurable business growth.
                                </p>
                            </details>
                        </div>
                        <div>
                            <details>
                                <summary title="Do you offer branding, personal branding, and SEO services?">Do you offer branding, personal branding, and SEO services?</summary>
                                <p className="et-faq-content">
                                    Yes. We provide complete brand strategy, logo design, visual identity, personal branding, and advanced SEO, AEO, and GEO optimization so your brand ranks top on Google and AI search engines.
                                </p>
                            </details>
                        </div>
                        <div>
                            <details>
                                <summary title="Do you provide digital marketing and creative internships?">Do you provide digital marketing and creative internships?</summary>
                                <p className="et-faq-content">
                                    Yes. As a women-led branding and marketing agency, Ethiroli empowers emerging talent through structured skill training, real-world internships, and hands-on campaign experience.
                                </p>
                            </details>
                        </div>
                    </div>
                </div>
            </section>
            <section className="et-map-section">
                <div className="et-map-frame">
                    <iframe
                        src="https://www.google.com/maps?q=Gopala+Krishnan+Complex,+Gugai,+Salem,+Tamil+Nadu+636006&output=embed"
                        title="Ethiroli Location"
                        className="et-map-iframe"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </section>
            <section className="et-cta-section">
                <div className="et-cta-content">
                    <h2 className="et-cta-title">LET'S BUILD IMPACT TOGETHER</h2>
                    <button type="button" className="et-btn" onClick={openConversation}>
                        Start a Conversation
                    </button>
                </div>
            </section>

            <ContactModal open={isConversationOpen} onClose={closeConversation} />
        </div>
    );
};

export default Contact;
