import { useState, useMemo } from 'react';
import './Testimonials.css';

export default function Testimonials() {
    const perPage = 4;

    // ✅ Fresh dummy testimonials data
    const testimonialsData = [
        {
            id: 1,
            name: "Florence Atieno",
            date: "2026-02-17", 
            story: "Securing a hospitality role in Munich was so seamless. The portal's guidance on the German culture and language basics was a game-changer for my first week!",
            imageUrl: ""
        },
        {
            id: 2,
            name: "Kennedy Mutua",
            date: "2026-02-15", 
            story: "I never thought my agricultural skills would take me to Europe. I'm now working in a sustainable farm in Bavaria. The processing was transparent all the way!",
            imageUrl: ""
        },
        {
            id: 3,
            name: "Mercy Chemutai",
            date: "2026-02-10", 
            story: "The caregiver program is incredible. I'm settled in Hamburg now, and the support I received for my visa and housing was top-notch. Highly recommend!",
            imageUrl: ""
        },
        {
            id: 4,
            name: "Peter Kamau",
            date: "2026-02-05",
            story: "Landed a construction role in Berlin through this portal. The 500+ job listings gave me so many options. Asante sana for this life-changing opportunity.",
            imageUrl: ""
        },
        {
            id: 5,
            name: "Sarah Wambui",
            date: "2026-01-28",
            story: "Moving as a professional seemed daunting, but the mentorship here made it a smooth walk. I'm now a hospitality lead in Stuttgart and loving it!",
            imageUrl: ""
        },
        {
            id: 6,
            name: "David Ochieng",
            date: "2026-01-20",
            story: "The interview preparation sessions helped me secure a logistics job in Frankfurt. I felt so confident talking to my German employers.",
            imageUrl: ""
        },
        {
            id: 7,
            name: "Lydia Nekesa",
            date: "2026-01-12",
            story: "I applied for a cleaning services role and got approved within 3 months. Everything from documentation to travel was handled with care.",
            imageUrl: ""
        },
        {
            id: 8,
            name: "Evans Kipkirui",
            date: "2026-01-05",
            story: "Professionalism at its best. I'm now working in a warehouse in Cologne. They really keep their word on assisting Kenyans to work in Germany.",
            imageUrl: ""
        },
        {
            id: 9,
            name: "Zainab Juma",
            date: "2025-12-28",
            story: "The community here is amazing. Being a caregiver in Berlin is fulfilling, and the transition was made easy by the step-by-step process on this portal.",
            imageUrl: ""
        },
        {
            id: 10,
            name: "Samuel Baraza",
            date: "2025-12-15",
            story: "Start Your Journey today! I'm officially a technician in Dusseldorf. Don't hesitate to apply if you have the skills. Germany is waiting!",
            imageUrl: ""
        }
    ];

    const [page, setPage] = useState(1);

    const totalPages = useMemo(
        () => Math.ceil(testimonialsData.length / perPage),
        [testimonialsData.length]
    );

    const currentItems = useMemo(() => {
        const start = (page - 1) * perPage;
        return testimonialsData.slice(start, start + perPage);
    }, [page]);

    const getRelativeDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        const diffInDays = Math.floor(diffInSeconds / 86400);

        if (diffInDays < 1) return "Today";
        if (diffInDays === 1) return "Yesterday";
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) {
            const weeks = Math.floor(diffInDays / 7);
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        }
        
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (testimonialsData.length === 0)
        return <p className="no-testimonials">No testimonials found.</p>;

    return (
        <section className="testimonials-container" aria-label="Client testimonials">
            <header className="testimonials-header">
                <h2>Success Stories from Our Community</h2>
                <p>Read inspiring stories from Kenyans who successfully landed jobs in Germany</p>
            </header>

            <div className="testimonial-cards">
                {currentItems.map(({ id, name, date, story, imageUrl }) => (
                    <article
                        key={id}
                        className="testimonial-card"
                        tabIndex={0}
                        aria-describedby={`testimonial-story-${id}`}
                    >
                        <div className="avatar-wrapper">
                            <img
                                src={imageUrl || '/testimonial-avatar.png'}
                                alt={`${name}'s avatar`}
                                className="avatar"
                                loading="lazy"
                                onError={e => (e.target.src = '/testimonial-avatar.png')}
                            />
                        </div>
                        <div className="testimonial-text">
                            <header>
                                <h3 className="testimonial-name">{name}</h3>
                                <time
                                    className="testimonial-date"
                                    dateTime={new Date(date).toISOString()}
                                >
                                    {getRelativeDate(date)}
                                </time>
                            </header>
                            <div
                                className="stars"
                                aria-label="5 star rating"
                                role="img"
                            >
                                <StarIcon />
                                <StarIcon />
                                <StarIcon />
                                <StarIcon />
                                <StarIcon />
                            </div>
                            <blockquote
                                className="testimonial-story"
                                id={`testimonial-story-${id}`}
                            >
                                {story}
                            </blockquote>
                        </div>
                    </article>
                ))}
            </div>

            {totalPages > 1 && (
                <nav
                    className="pagination"
                    aria-label="Testimonials Pagination"
                >
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="pagination-button"
                    >
                        ← Prev
                    </button>
                    <span className="pagination-info">
                        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="pagination-button"
                    >
                        Next →
                    </button>
                </nav>
            )}
        </section>
    );
}

// Inline SVG star component
function StarIcon() {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="#FFC107"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: '2px' }}
        >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
    );
}
