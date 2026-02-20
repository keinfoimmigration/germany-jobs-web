import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
    return (
        <div className="home">
            {/* Hero Section */}
            <header className="hero" style={{
                backgroundImage: 'url(https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg?auto=compress&cs=tinysrgb&w=1400)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <div className="hero-content">
                    <div className="logo-section">
                        <div className="logo-container">
                            <span className="flag">🇰🇪</span>
                            <h1 className="portal-heading">GERMANY-KENYA<br />PORTAL</h1>
                            <span className="flag">🇩🇪</span>
                        </div>
                    </div>
                    <h2>Employment & Immigration Gateway</h2>
                    <p>Connect with top German employers and launch your international career</p>
                    <div className="hero-cta">
                        <Link to="/jobdetail" className="cta-button primary">Browse 40+ Jobs</Link>
                        <Link to="/testimonials" className="cta-button secondary">Success Stories</Link>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="features">
                <div className="feature-grid">
                    <div className="feature-card">
                        <div className="feature-icon">💼</div>
                        <h3>40+ Quality Jobs</h3>
                        <p>Carefully curated positions from top German companies across various sectors.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">✓</div>
                        <h3>Easy Application</h3>
                        <p>Upload your ID (front & back) and passport photo via our secure portal.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🌟</div>
                        <h3>30+ Success Stories</h3>
                        <p>Read real testimonials from Kenyans who successfully landed jobs in Germany.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🇩🇪</div>
                        <h3>Verified Employers</h3>
                        <p>Connect with legitimate German companies actively hiring international talent.</p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="intro">
                <h2>How It Works: From Application to Interview</h2>
                <div className="steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h4>Explore Jobs</h4>
                        <p>Browse 40+ curated job listings from verified German employers across Berlin, Munich, Frankfurt, and more.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <h4>Submit Application</h4>
                        <p>Upload your ID (front & back) and passport photo using our secure portal.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <h4>Check Status</h4>
                        <p>Use your Application Number or Mobile Number in the portal to track your application progress.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">4</div>
                        <h4>Book Interview</h4>
                        <p>Once your application is reviewed, book your preferred interview date and time. Our team will call you to confirm the details. 🌟</p>
                    </div>
                </div>
                <p className="intro-text">
                    This portal is your official gateway connecting Kenyan professionals with career opportunities in Germany.
                    Follow the steps above to apply with confidence. After booking your interview, relax and get ready—our team will reach out to guide you through the next stage of your exciting journey abroad.
                </p>
            </section>
        </div>
    );
}