import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => setIsOpen(false);

    return (
        <header className="navbar">
            <div className="navbar-container">

                {/* BRAND */}
                <Link to="/" className="navbar-brand" onClick={closeMenu}>
                    <img
                        src="/kenya-gov-logo.png"
                        alt="Germany Kenya Job Portal Logo"
                        className="nav-logo"
                    />
                    <span className="brand-text">
                        Germany–Kenya
                        <small>Job Portal</small>
                    </span>
                </Link>

                {/* HAMBURGER */}
                <button
                    className={`hamburger ${isOpen ? "open" : ""}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle navigation"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* MENU */}
                <nav className={`navbar-menu ${isOpen ? "active" : ""}`}>
                    <NavLink
                        to="/testimonials"
                        className="navbar-link"
                        onClick={closeMenu}
                    >
                        Testimonials
                    </NavLink>

                    <NavLink
                        to="/jobdetail"
                        className="navbar-cta"
                        onClick={closeMenu}
                    >
                        Apply Now
                    </NavLink>
                </nav>

            </div>
        </header>
    );
}
