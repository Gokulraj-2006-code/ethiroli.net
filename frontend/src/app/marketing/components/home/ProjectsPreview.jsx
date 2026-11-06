import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const projects = [
    {
        title: "Aarogya Hospitals",
        category: "Branding",
        image: "/assets/images/services/project_atti_cafe.jpg"
    },
    {
        title: "Sri Sai Foods",
        category: "Social Media",
        image: "/assets/images/services/project_aura_ecommerce.jpg"
    },
    {
        title: "VetriTech",
        category: "Video Production",
        image: "/assets/images/services/video.png"
    },
    {
        title: "Maruthi Constructions",
        category: "Website Design",
        image: "/assets/images/services/project_kottai_varahi.jpg"
    },
    {
        title: "Aruvi Tours",
        category: "Travel Website",
        image: "/assets/images/services/project_aruvi_tours.svg"
    },
    {
        title: "Infinity Marathon",
        category: "Marathon Website",
        image: "/assets/images/services/project_marathon.jpg"
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

const ProjectsPreview = () => {
    return (
        <section className="replica-portfolio-section" id="projects">
            <div className="replica-container">
                <motion.div 
                    className="replica-portfolio-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div>
                        <div style={{ marginBottom: '8px' }}>
                            <span className="subtitle">
                                <span className="star-rotate">★</span> Our Work
                            </span>
                        </div>
                        <h2 className="replica-portfolio-title">Real Projects. Real Results.</h2>
                    </div>
                    <Link to="/projects" className="replica-portfolio-viewall">
                        View All Projects{' '}
                        <motion.span
                            className="et-arrow-nudge"
                            aria-hidden="true"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            &rarr;
                        </motion.span>
                    </Link>
                </motion.div>

                <motion.div
                    className="replica-portfolio-grid"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={stagger}
                >
                    {projects.map((proj, idx) => (
                        <motion.div 
                            className="replica-project-card" 
                            key={idx}
                            variants={fadeUp}
                            whileHover={{ y: -8, transition: { duration: 0.25 } }}
                        >
                            <img 
                                src={proj.image} 
                                alt={proj.title} 
                                className="replica-project-img" 
                                loading="lazy"
                            />
                            <div className="replica-project-info">
                                <div className="replica-project-cat">{proj.category}</div>
                                <div className="replica-project-name">{proj.title}</div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default ProjectsPreview;

