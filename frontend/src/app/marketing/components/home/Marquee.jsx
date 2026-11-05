import React from 'react';
import { motion } from 'framer-motion';

const clientLogos = [
    {
        name: "ATTI CAFE",
        logo: "/assets/images/logos/atti_cafe.svg"
    },
    {
        name: "PASTRY NATION",
        logo: "/assets/images/logos/pastry_nation.svg"
    },
    {
        name: "JAYDEV CONSULTANCY",
        logo: "/assets/images/logos/jaydev.svg"
    },
    {
        name: "MAVALLI BIRIYANI",
        logo: "/assets/images/logos/mavalli_biriyani.svg"
    },
    {
        name: "JCI ELITE",
        logo: "/assets/images/logos/jci_elite.svg"
    },
    {
        name: "ARUVI TOURS",
        logo: "/assets/images/logos/aruvi_tours.svg"
    }
];

const Marquee = () => {
    return (
        <section className="replica-logos-section">
            <motion.div 
                className="replica-container" 
                style={{ textAlign: 'center', marginBottom: '24px' }}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <span className="subtitle">
                    <span className="star-rotate">★</span> Trusted by Businesses Across Industries
                </span>
            </motion.div>
            
            {/* Infinite Marquee Logo Scroll */}
            <motion.div 
                className="replica-marquee-container"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
            >
                <div className="replica-marquee-track">
                    {/* First set of logos */}
                    {clientLogos.map((client, idx) => (
                        <div className="replica-logo-item" key={`orig-${idx}`}>
                            <img 
                                src={client.logo} 
                                alt={`${client.name} logo`} 
                                className="replica-logo-img" 
                                loading="lazy"
                            />
                        </div>
                    ))}
                    {/* Cloned set 1 for infinite continuous scrolling */}
                    {clientLogos.map((client, idx) => (
                        <div className="replica-logo-item" key={`clone-1-${idx}`} aria-hidden="true">
                            <img 
                                src={client.logo} 
                                alt="" 
                                className="replica-logo-img" 
                                loading="lazy"
                            />
                        </div>
                    ))}
                    {/* Cloned set 2 to guarantee seamlessness on ultra-wide screens */}
                    {clientLogos.map((client, idx) => (
                        <div className="replica-logo-item" key={`clone-2-${idx}`} aria-hidden="true">
                            <img 
                                src={client.logo} 
                                alt="" 
                                className="replica-logo-img" 
                                loading="lazy"
                            />
                        </div>
                    ))}
                    {/* Cloned set 3 */}
                    {clientLogos.map((client, idx) => (
                        <div className="replica-logo-item" key={`clone-3-${idx}`} aria-hidden="true">
                            <img 
                                src={client.logo} 
                                alt="" 
                                className="replica-logo-img" 
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default Marquee;

