import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/shared/SEO';
import Hero from '../components/about/Hero';
import Introduction from '../components/about/Introduction';
import VisionMission from '../components/about/VisionMission';
import Leadership from '../components/about/Leadership';
import Team from '../components/about/Team';
import Projects from '../components/about/Projects';
import CTAJoin from '../components/about/CTAJoin';
import CTAabout from '../components/about/CTAabout';

const About = () => {
    const location = useLocation();

    // Hash links (e.g. the footer's "Our Team" link) arrive before this lazy
    // page has rendered, so jump to the section once its markup is in place.
    useEffect(() => {
        if (!location.hash) return undefined;

        const targetId = decodeURIComponent(location.hash.slice(1));
        const jumpToTarget = () => {
            // 'instant' overrides the site-wide smooth scrolling, and a second
            // pass corrects for lazy images that load while the page settles.
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'instant', block: 'start' });
        };
        const timer = window.setTimeout(jumpToTarget, 350);
        const settleTimer = window.setTimeout(jumpToTarget, 1200);

        return () => {
            window.clearTimeout(timer);
            window.clearTimeout(settleTimer);
        };
    }, [location.hash]);

    return (
        <div className="ab-page">
            <SEO
                title="About Us — Ethiroli | Creative Branding & Marketing Agency"
                description="Discover Ethiroli, a premier women-led branding and marketing agency in Tamil Nadu. We empower brands with iconic design, marketing automation, and performance campaigns."
                canonical="https://ethiroli.net/about"
                keywords="about ethiroli, branding agency team, marketing agency founders, women-led marketing agency, Salem branding agency"
            />
            <Hero />
            <Introduction />
            <VisionMission />
            <Leadership />
            <Team />
            <Projects />
            <CTAabout />
        </div>
    );
};

export default About;
