import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
    {
        quote: "Idhu Namma Spot — Salem's spot for coffee & snacks. Rated 4.8/5 (165 reviews) — 'cool atmosphere'.",
        name: "ATTI CAFE",
        company: "Rated 4.8/5 · Salem, TN",
        logo: "/assets/images/logos/atti_cafe.svg",
        stars: "★★★★★"
    },
    {
        quote: "Salem's favorite bakery — teacakes, cheese buns & banana cake. Cozy vibes, melt-in-your-mouth bakes.",
        name: "PASTRY NATION",
        company: "Bakery & Cafe · Salem, TN",
        logo: "/assets/images/logos/pastry_nation.svg",
        stars: "★★★★★"
    },
    {
        quote: "Job training & placements — Salem's trusted recruitment consultancy. 'Jobs with good salaries via their guidance.'",
        name: "JAYDEV CONSULTANCY",
        company: "Job Consultancy · Salem, TN",
        logo: "/assets/images/logos/jaydev.svg",
        stars: "★★★★★"
    },
    {
        quote: "Taste of 1952 — famous wood-fire mutton biryani. Rated 4.0/5 (1,445 reviews). A pioneer since 1952.",
        name: "MAVALLI BIRIYANI",
        company: "Rated 4.0/5 · Bangalore",
        logo: "/assets/images/logos/mavalli_biriyani.svg",
        stars: "★★★★☆"
    },
    {
        quote: "Junior Chamber LO under JCI India — leadership training for young professionals aged 18–40.",
        name: "JCI ELITE",
        company: "Junior Chamber · Salem, TN",
        logo: "/assets/images/logos/jci_elite.svg",
        stars: "★★★★★"
    },
    {
        quote: "Best tour operator in Tamil Nadu — customized, budget-friendly trips. Rated 4.7/5 on Justdial.",
        name: "ARUVI TOURS",
        company: "Tour Operator · Salem, TN",
        logo: "/assets/images/logos/aruvi_tours.svg",
        stars: "★★★★★"
    }
];

// Render the set twice so the auto-scroll loops seamlessly (translateX -50%).
const marqueeItems = [...testimonials, ...testimonials];

const Testimonials = () => {
    return (
        <section className="replica-testimonials-section" id="testimonials">
            <div className="replica-container">
                <motion.div
                    className="replica-test-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div>
                        <div style={{ marginBottom: '8px' }}>
                            <span className="subtitle">
                                <span className="star-rotate">★</span> Client Testimonials
                            </span>
                        </div>
                        <h2 className="replica-test-title">What Our Clients Say</h2>
                    </div>
                </motion.div>

                <motion.div
                    className="replica-test-marquee"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                >
                    <div className="replica-test-track">
                        {marqueeItems.map((item, idx) => {
                            const isClone = idx >= testimonials.length;
                            return (
                                <div
                                    className="replica-test-card"
                                    key={`${item.name}-${idx}`}
                                    aria-hidden={isClone}
                                >
                                    <div className="replica-test-card-top">
                                        <div className="replica-quote-icon">&ldquo;</div>
                                        <img
                                            className="replica-client-logo"
                                            src={item.logo}
                                            alt={`${item.name} logo`}
                                            loading="eager"
                                        />
                                    </div>
                                    <p className="replica-quote-text">"{item.quote}"</p>
                                    <div className="replica-client-meta">
                                        <div>
                                            <div className="replica-client-name">{item.name}</div>
                                            <div className="replica-client-corp">{item.company}</div>
                                        </div>
                                        <div className="replica-star-row">{item.stars}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Testimonials;
