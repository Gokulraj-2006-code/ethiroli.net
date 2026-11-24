import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const location = useLocation();

    const NAV_ITEMS = [
        { label: 'Home', to: '/', icon: 'fa-solid fa-house', isActive: (path) => path === '/' },
        { label: 'About Us', to: '/about', icon: 'fa-solid fa-circle-info', isActive: (path) => path === '/about' },
        { label: 'Services', to: '/services', icon: 'fa-solid fa-layer-group', isActive: (path) => path === '/services' },
        { label: 'Project', to: '/projects', icon: 'fa-solid fa-diagram-project', isActive: (path) => path.startsWith('/projects') },
        { label: 'Career', to: '/career', icon: 'fa-solid fa-briefcase', isActive: (path) => path === '/career' },
        { label: 'Contact', to: '/contact_us', icon: 'fa-solid fa-envelope', isActive: (path) => path === '/contact_us' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }

            // Keep the header (including the mobile menu button) visible at all
            // times instead of hiding it while scrolling down the page.
            setHidden(false);

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const isAbout = location.pathname === '/about';
    // Close the drawer whenever the route changes.
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Lock page scrolling and support Escape while the drawer is open.
    useEffect(() => {
        if (!menuOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.body.classList.add('mobile-menu-open');

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.classList.remove('mobile-menu-open');
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [menuOpen]);

    return (
        <nav
            className={`main-nav ${scrolled ? 'scrolled' : ''}${isAbout ? ' about-nav' : ''}${menuOpen ? ' menu-open' : ''}`}
            id="navbar"
            style={{ transform: 'translateY(0)' }}
        >
            <div className="nav-container">
                <button
                    className={`hamburger ${menuOpen ? 'open' : ''}`}
                    id="hamburger-btn"
                    aria-label="Menu"
                    aria-expanded={menuOpen}
                    onClick={toggleMenu}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <Link to="/" className="logo">
                    <img src="/assets/images/ethiroli_logo.png" alt="Ethiroli Logo" />
                </Link>
                <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About Us</Link></li>
                    <li><Link to="/services" className={location.pathname === '/services' ? 'active' : ''}>Services</Link></li>
                    <li><Link to="/projects" className={location.pathname.startsWith('/projects') ? 'active' : ''}>Project</Link></li>
                    <li><Link to="/career" className={location.pathname === '/career' ? 'active' : ''}>Career</Link></li>
                    <li><Link to="/contact_us" className={location.pathname === '/contact_us' ? 'active' : ''}>Contact</Link></li>
                </ul>
                {location.pathname !== '/contact_us' && (
                    <div className="nav-actions">
                        <Link to="/contact_us" className="btn">Get in Touch</Link>
                    </div>
                )}
            </div>

            <div
                className={`mobile-menu-backdrop ${menuOpen ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
            ></div>

            <div className={`mobile-menu ${menuOpen ? 'active' : ''}`} id="mobile-menu" aria-hidden={!menuOpen}>
                <div className="mobile-menu-head">
                    <Link to="/" className="mobile-menu-brand" onClick={() => setMenuOpen(false)} aria-label="Ethiroli home">
                        <img src="/assets/images/ethiroli_logo.png" alt="" />
                        <span>
                            <strong>ETHIROLI</strong>
                            <small>Branding &amp; Marketing</small>
                        </span>
                    </Link>
                    <button
                        type="button"
                        className="mobile-menu-close"
                        aria-label="Close menu"
                        onClick={() => setMenuOpen(false)}
                    >
                        &times;
                    </button>
                </div>

                <nav className="mobile-menu-nav" aria-label="Mobile navigation">
                    <ul>
                        {NAV_ITEMS.map((item) => (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    className={`mobile-link ${item.isActive(location.pathname) ? 'active' : ''}`}
                                    onClick={() => setMenuOpen(false)}
                                    aria-current={item.isActive(location.pathname) ? 'page' : undefined}
                                >
                                    <span className="mobile-link-icon" aria-hidden="true">
                                        <i className={item.icon}></i>
                                    </span>
                                    <span className="mobile-link-label">{item.label}</span>
                                    <i className="fa-solid fa-chevron-right mobile-link-arrow" aria-hidden="true"></i>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="mobile-menu-foot">
                    {location.pathname !== '/contact_us' && (
                        <Link to="/contact_us" className="mobile-menu-cta" onClick={() => setMenuOpen(false)}>
                            Get in Touch
                        </Link>
                    )}
                    <a className="mobile-menu-contact" href="tel:+916380049042">
                        <i className="fa-solid fa-phone" aria-hidden="true"></i>
                        +91 63800 49042
                    </a>
                    <a className="mobile-menu-contact" href="mailto:ethiroli.net@gmail.com">
                        <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                        ethiroli.net@gmail.com
                    </a>
                    <div className="mobile-menu-social">
                        <a href="https://www.instagram.com/_ethiroli_?igsh=MXQ1MTZuaXlhaGVyaA==" title="Instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <i className="fa-brands fa-instagram" aria-hidden="true"></i>
                        </a>
                        <a href="https://www.linkedin.com/company/ethiroli-pvt-ltd/" title="LinkedIn" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <i className="fa-brands fa-linkedin-in" aria-hidden="true"></i>
                        </a>
                        <a href="https://wa.me/916380049042?text=Hello%20Ethiroli!%20I%20would%20like%20to%20inquire%20about%20your%20services." title="WhatsApp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                            <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
        
    );
};

export default Navbar;
