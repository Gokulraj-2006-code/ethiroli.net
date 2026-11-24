import React from 'react';
import { motion } from 'framer-motion';

/**
 * Compact, on-brand hero used by the informational pages (legal + sitemap).
 * Replaces the oversized banner hero those pages previously borrowed from
 * the About page.
 */
const PageHero = ({ eyebrow, title, subtitle }) => {
    return (
        <section className="page-hero">
            <div className="page-hero-glow page-hero-glow-one" aria-hidden="true"></div>
            <div className="page-hero-glow page-hero-glow-two" aria-hidden="true"></div>
            <div className="page-hero-inner">
                <motion.div
                    className="page-hero-content"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="page-hero-eyebrow">
                        <i className="fa-solid fa-star" aria-hidden="true"></i>
                        {eyebrow}
                    </span>
                    <h1>{title}</h1>
                    {subtitle ? <p>{subtitle}</p> : null}
                </motion.div>
            </div>
        </section>
    );
};

export default PageHero;
