import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
     <header className="hero" style={{
  backgroundImage: 'url(https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg?auto=compress&cs=tinysrgb&w=1400)',
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}}>

        <div className="hero-content">
          <div className="logo-section">
            <div className="logo-container">
              <span className="flag">🇰🇪</span>
              <h1 className="portal-heading">GERMANY-KENYA<br/>PORTAL</h1>
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
            <p>Simple one-step process to apply directly. Your information is securely saved.</p>
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

      <section className="intro">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Explore Jobs</h4>
            <p>Browse our 40+ curated job listings from verified German employers.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Apply Easily</h4>
            <p>Submit your application with CV and cover letter through our secure portal.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Get Connected</h4>
            <p>Connect directly with employers and begin your German career journey today.</p>
          </div>
        </div>
        <p className="intro-text">
          This portal is your dedicated gateway connecting Kenyan professionals to exceptional career opportunities in Germany. 
          We partner with verified employers across Berlin, Munich, Frankfurt, Hamburg and other major German cities. 
          Explore current openings, submit applications with confidence, and read inspiring success stories from applicants 
          who have already relocated and thriving in their German careers.
        </p>
      </section>
    </div>
  );
}
