import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const solutions = [
    {
        title: "Brand",
        icon: "✎",
        bullets: [
            "Branding",
            "Logo & Visual Identity",
            "Brand Strategy",
            "Website Design"
        ],
        link: "/services"
    },
    {
        title: "Grow",
        icon: "📊",
        bullets: [
            "Social Media Marketing",
            "SEO",
            "Performance Marketing",
            "Content Marketing"
        ],
        link: "/services"
    },
    {
        title: "Create",
        icon: "▶",
        bullets: [
            "Video Production",
            "Reels & Shorts",
            "Photography",
            "Creative Design"
        ],
        link: "/services"
    },
    {
        title: "Automate",
        icon: "⚙",
        bullets: [
            "AI Automation",
            "Business Automation",
            "CRM & Lead Automation",
            "Workflow Solutions"
        ],
        link: "/services"
    }
];

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 35 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const ServicesSlider = () => {
    return (
        <section className="replica-services-section" id="services">
            <div className="replica-container">
                <motion.div 
                    style={{ textAlign: 'center', marginBottom: '14px' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="subtitle" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--base-gold)', borderColor: 'rgba(232,214,87,0.3)' }}>
                        <span className="star-rotate">★</span> Our Solutions
                    </span>
                    <h2 className="replica-services-title" style={{ marginTop: '14px' }}>From Ideas to Impact</h2>
                    <p className="replica-services-sub">
                        We help businesses build, grow and automate for a stronger tomorrow.
                    </p>
                </motion.div>

                <motion.div
                    className="replica-services-grid"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={stagger}
                >
                    {solutions.map((item, idx) => (
                        <motion.div 
                            className="replica-service-card" 
                            key={idx}
                            variants={fadeUp}
                            whileHover={{ y: -8, transition: { duration: 0.25 } }}
                        >
                            <motion.div
                                className="replica-service-badge"
                                whileHover={{ scale: 1.1, rotate: 6 }}
                                transition={{ duration: 0.2 }}
                            >
                                {item.icon}
                            </motion.div>
                            <h3 className="replica-service-name">{item.title}</h3>
                            <ul className="replica-service-bullets">
                                {item.bullets.map((bullet, bIdx) => (
                                    <li key={bIdx}>{bullet}</li>
                                ))}
                            </ul>
                            <Link to={item.link} className="replica-service-learn">
                                Learn More{' '}
                                <motion.span
                                    className="et-arrow-nudge"
                                    aria-hidden="true"
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.2 }}
                                >
                                    &rarr;
                                </motion.span>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default ServicesSlider;

