import React from 'react';
import { motion } from 'framer-motion';

const differentiators = [
    {
        icon: "💡",
        title: "Strategy First",
        description: "We plan, not just post."
    },
    {
        icon: "✨",
        title: "Creative + Marketing",
        description: "Ideas that drive results."
    },
    {
        icon: "⚙",
        title: "Technology + Automation",
        description: "Work smarter, grow faster."
    },
    {
        icon: "📈",
        title: "Business Focused",
        description: "Visibility, leads and growth."
    }
];

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const Activities = () => {
    return (
        <section className="replica-why-section" id="why-ethiroli">
            <div className="replica-container">
                <motion.div 
                    style={{ textAlign: 'center', marginBottom: '14px' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="subtitle" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--base-gold)', borderColor: 'rgba(232,214,87,0.3)' }}>
                        <span className="star-rotate">★</span> Why Ethiroli?
                    </span>
                    <h2 className="replica-why-title" style={{ marginTop: '14px' }}>
                        More Than Just a <span className="gold-accent">Marketing Agency</span>
                    </h2>
                    <p className="replica-why-sub">
                        We combine creativity, marketing and technology to deliver real business value.
                    </p>
                </motion.div>

                <motion.div
                    className="replica-why-grid"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={stagger}
                >
                    {differentiators.map((item, idx) => (
                        <motion.div 
                            className="replica-why-item" 
                            key={idx}
                            variants={fadeUp}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        >
                            <motion.div
                                className="replica-why-icon"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.35 }}
                            >
                                {item.icon}
                            </motion.div>
                            <h3 className="replica-why-heading">{item.title}</h3>
                            <p className="replica-why-text">{item.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Activities;

