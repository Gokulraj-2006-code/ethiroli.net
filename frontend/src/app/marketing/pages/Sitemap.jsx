import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/shared/SEO';
import PageHero from '../components/shared/PageHero';

const sitemapSections = [
  {
    category: 'Core Pages',
    icon: 'home',
    links: [
      { name: 'Home — Branding & Marketing Agency', path: '/' },
      { name: 'About Us — Mission, Vision & Team', path: '/about' },
      { name: 'Services — Branding, Marketing & Automation', path: '/services' },
      { name: 'Projects — Portfolio & Case Studies', path: '/projects' },
      { name: 'Career — Internships & Openings', path: '/career' },
      { name: 'Contact Us — Inquiries & Consultations', path: '/contact_us' },
    ],
  },
  {
    category: 'Branding & Marketing Services',
    icon: 'palette',
    links: [
      { name: 'Brand Identity & Visual Storytelling', path: '/services#disciplines' },
      { name: 'Performance Marketing & Multi-Channel Ads', path: '/services#disciplines' },
      { name: 'Marketing Automation & Lead Funnels', path: '/services#disciplines' },
      { name: 'SEO, AEO & GEO (AI Search Optimization)', path: '/services#disciplines' },
      { name: 'Brand UI/UX Design & Landing Pages', path: '/services#disciplines' },
      { name: 'Video Marketing & Motion Production', path: '/services#disciplines' },
      { name: 'Lead Generation & Sales Pipelines', path: '/services#disciplines' },
    ],
  },
  {
    category: 'Case Studies & Community Impact',
    icon: 'campaign',
    links: [
      { name: 'Empowering Women with JCI & Digital Skills', path: '/projects/jci-digital-skills' },
      { name: 'Glamers Gathering — Fashion & Media Event', path: '/projects/glamers-gathering' },
      { name: 'Empowering Students Seminar (Jayarani College)', path: '/projects/Ethiroliseminarjayarani' },
      { name: 'Digital Strategy & Business Models (KSRCT)', path: '/projects/Ethiroliseminarksrct' },
    ],
  },
  {
    category: 'Careers & Team',
    icon: 'work',
    links: [
      { name: 'Careers & Internship Opportunities', path: '/career' },
      { name: 'Apply for Open Positions', path: '/career/apply' },
      { name: 'Leadership & Creative Team', path: '/about#team' },
    ],
  },
  {
    category: 'Legal, Compliance & Meta',
    icon: 'policy',
    links: [
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Terms of Service', path: '/terms-of-service' },
      { name: 'Frequently Asked Questions (FAQs)', path: '/contact_us#faq' },
      { name: 'XML Sitemap (Search Engines)', path: '/sitemap.xml', external: true },
    ],
  },
];

const Sitemap = () => {
  return (
    <div className="sitemap-page">
      <SEO
        title="HTML Sitemap — Ethiroli Branding & Marketing Agency"
        description="Comprehensive sitemap of Ethiroli. Explore our branding, performance marketing, marketing automation, SEO/AEO/GEO services, and case studies on ethiroli.net."
        canonical="https://ethiroli.net/sitemap"
        keywords="sitemap, ethiroli sitemap, branding agency pages, marketing agency navigation, ethiroli.net"
      />
      <PageHero
        eyebrow="Site Directory"
        title="Site Directory & Sitemap"
        subtitle="A complete guide to every page, service and resource on ethiroli.net."
      />

      <div className="sitemap-shell">
        <div className="sitemap-intro">
          <span className="sitemap-count">{sitemapSections.length} sections</span>
          <span>{sitemapSections.reduce((total, section) => total + section.links.length, 0)} links across the site</span>
        </div>

        <div className="sitemap-grid">
          {sitemapSections.map((section, index) => (
            <motion.section
              key={section.category}
              className="sitemap-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <div className="sitemap-card-head">
                <span className="sitemap-card-icon" aria-hidden="true">
                  <span className="material-symbols-outlined">{section.icon}</span>
                </span>
                <h2>{section.category}</h2>
                <span className="sitemap-card-count">{section.links.length}</span>
              </div>
              <ul className="sitemap-links">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a href={link.path} target="_blank" rel="noopener noreferrer">
                        <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                        <span>{link.name}</span>
                      </a>
                    ) : (
                      <Link to={link.path}>
                        <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                        <span>{link.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>

        <div className="sitemap-note">
          <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
          Looking for the machine-readable version? <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">Open the XML sitemap</a>.
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
