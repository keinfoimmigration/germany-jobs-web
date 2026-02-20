import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const closeMenu = () => setIsOpen(false);

    // Automatically close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    return (
        <header className="navbar">
            <div className="navbar-container">

                {/* BRAND */}
                <Link to="/" className="navbar-brand">
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
                        className={({ isActive }) =>
                            isActive ? "navbar-link active" : "navbar-link"
                        }
                    >
                        Testimonials
                    </NavLink>

                    <NavLink
                        to="/checkstatus"
                        className={({ isActive }) =>
                            isActive ? "navbar-link active" : "navbar-link"
                        }
                    >
                        Check Status
                    </NavLink>

                    <NavLink
                        to="/jobdetail"
                        className={({ isActive }) =>
                            isActive ? "navbar-cta active-cta" : "navbar-cta"
                        }
                    >
                        Apply Now
                    </NavLink>

                </nav>

            </div>
        </header>
    );
}