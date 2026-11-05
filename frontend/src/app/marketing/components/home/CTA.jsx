import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const CTA = () => {
    return (
        <section className="replica-strong-cta-section" id="cta">
            <div className="replica-container">
                <motion.div 
                    className="replica-cta-banner"
                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    <motion.div
                        className="replica-cta-content"
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.div style={{ marginBottom: '12px' }} variants={fadeUp}>
                            <span className="subtitle" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--base-gold)', borderColor: 'rgba(232,214,87,0.3)' }}>
                                <span className="star-rotate">★</span> Let's Build Something Great
                            </span>
                        </motion.div>
                        <motion.h2 className="replica-cta-heading" variants={fadeUp}>Ready to Take Your Business to the Next Level?</motion.h2>
                        <motion.p className="replica-cta-sub" variants={fadeUp}>Let's discuss how Ethiroli can help you grow.</motion.p>

                        <motion.div className="replica-cta-buttons" variants={fadeUp}>
                            <Link to="/contact_us" className="replica-btn-gold">
                                Get a Free Consultation{' '}
                                <motion.span
                                    className="et-arrow-nudge"
                                    aria-hidden="true"
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    &rarr;
                                </motion.span>
                            </Link>
                            <a 
                                href="https://wa.me/916380049042?text=Hello%20Ethiroli!%20I%20would%20like%20to%20inquire%20about%20your%20services." 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="replica-btn-dark-outline"
                            >
                                &#128172; Chat on WhatsApp
                            </a>
                        </motion.div>
                    </motion.div>

                    <div className="replica-cta-backdrop">
                        <motion.img 
                            src="/assets/images/banner/golden_ribbon_cta.jpg" 
                            alt="Bigger Brighter Together" 
                            className="replica-cta-img"
                            loading="lazy"
                            initial={{ opacity: 0, scale: 1.04 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        />
                        <motion.div 
                            className="replica-cta-script"
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <motion.span
                                style={{ display: 'inline-block' }}
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                Bigger. Brighter. Together.
                            </motion.span>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTA;
