import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const location = useLocation();

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

    // Close the drawer whenever the route changes.
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Lock page scrolling and support Escape while the drawer is open.
    useEffect(() => {
        if (!menuOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [menuOpen]);

    return (
        <nav
            className={`main-nav ${scrolled ? 'scrolled' : ''}`}
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

            <div className={`mobile-menu ${menuOpen ? 'active' : ''}`} id="mobile-menu">
                <button
                    type="button"
                    className="mobile-menu-close"
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                >
                    &times;
                </button>
                <ul>
                    <li><Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>Home</Link></li>
                    <li><Link to="/about" className="mobile-link" onClick={() => setMenuOpen(false)}>About Us</Link></li>
                    <li><Link to="/services" className="mobile-link" onClick={() => setMenuOpen(false)}>Services</Link></li>
                    <li><Link to="/projects" className="mobile-link" onClick={() => setMenuOpen(false)}>Project</Link></li>
                    <li><Link to="/career" className="mobile-link" onClick={() => setMenuOpen(false)}>Career</Link></li>
                    <li><Link to="/contact_us" className="mobile-link" onClick={() => setMenuOpen(false)}>Contact</Link></li>
                </ul>
                {location.pathname !== '/contact_us' && (
                    <Link to="/contact_us" className="btn" onClick={() => setMenuOpen(false)}>Get in Touch</Link>
                )}
            </div>
        </nav>
        
    );
};

export default Navbar;
