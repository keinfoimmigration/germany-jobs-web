import "./Footer.css"; // make sure your CSS file is in the same folder

export default function Footer() {
    return (
        <footer className="footer">

            {/* Top Authority Strip */}
            <div className="footer-authority">
                <span className="flag">🇰🇪</span>
                Official Bilateral Cooperation Portal • Republic of Kenya ↔ Federal Republic of Germany
                <span className="flag">🇩🇪</span>
            </div>

            <div className="footer-inner">

                {/* About Section */}
                <div className="footer-section footer-about">
                    <h4>Germany–Kenya Immigration Portal</h4>
                    <p>
                        This official portal facilitates transparent and secure
                        recruitment of Kenyan professionals for verified employment
                        opportunities in Germany.
                    </p>

                    <div className="footer-logos">
                        <div className="gov-logo">
                            <img src="/kenya-gov-logo.png" alt="Government of Kenya" title="Government of Kenya" />
                            <span className="gov-name">Government of Kenya</span>
                        </div>
                        <span className="logo-divider">↔</span>
                        <div className="gov-logo">
                            <img src="/germany-federal-logo.png" alt="Federal Republic of Germany" title="Federal Republic of Germany" />
                            <span className="gov-name">Federal Republic of Germany</span>
                        </div>
                    </div>
                </div>

                {/* Services */}
                <div className="footer-section">
                    <h4>Services</h4>
                    <ul>
                        <li><a href="/jobdetail">Verified Job Listings</a></li>
                        <li><a href="/jobdetail">Application Process</a></li>
                        <li><a >Eligibility Requirements</a></li>
                        <li><a >Frequently Asked Questions</a></li>
                    </ul>
                </div>

                {/* Legal & Compliance */}
                <div className="footer-section">
                    <h4>Legal & Compliance</h4>
                    <ul>
                        <li><a >Privacy Policy</a></li>
                        <li><a >Terms of Service</a></li>
                        <li><a >Data Protection (GDPR)</a></li>
                        <li><a >Report Misconduct</a></li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="footer-section footer-contact">
                    <h4>Official Contact</h4>
                    <p><strong>Email:</strong> info@immigration-portal.de</p>
                    <p><strong>WhatsApp Number:</strong> +254140526299</p>
                    <p><strong>Office:</strong> Nairobi, Kenya</p>

                    <div className="footer-ecitizen">
                        <img src="/kenya-gov-logo.png" alt="Immigration Portal" />
                        <p>Verified via Official Government Channels</p>
                    </div>
                </div>

            </div>

            {/* Bottom Section */}
            <div className="footer-bottom">
                <p>© 2026 Germany–Kenya Immigration Portal. All Rights Reserved.</p>
                <p>
                    This platform operates in cooperation with relevant Kenyan and German authorities.
                </p>
            </div>

        </footer>
    );
}
