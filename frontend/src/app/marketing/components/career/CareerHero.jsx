import React from 'react';
import { motion } from 'framer-motion';

const CareerHero = () => {
  return (
    <section
      className="ab-hero"
      style={{ backgroundImage: "linear-gradient(135deg, rgba(8, 20, 19, 0.86), rgba(26, 75, 72, 0.62)), url('/assets/images/projects/career-team.jpg')" }}
    >
      <div className="ab-hero-content">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Careers At Ethiroli
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Build real-world experience with meaningful internship opportunities.
        </motion.p>
      </div>
    </section>
  );
};

export default CareerHero;
