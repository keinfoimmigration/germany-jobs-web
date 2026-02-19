import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Jobs.css';

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 5;

    useEffect(() => {
        let isMounted = true;

        fetch('https://localhost:44369/api/jobs')
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => {
                if (isMounted) {
                    setJobs(data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error('Failed to load jobs:', err);
                    setError('Failed to load job listings. Please try again later.');
                    setLoading(false);
                }
            });

        return () => { isMounted = false; };
    }, []);

    const countryFlags = {
        Germany: '🇩🇪',
        Kenya: '🇰🇪',
    };

    if (loading) {
        return (
            <div className="jobs">
                <p className="loading-message">{error || 'Loading available positions...'}</p>
            </div>
        );
    }

    // Pagination logic
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(jobs.length / jobsPerPage);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div className="jobs">
            <div className="jobs-header">
                <h2>Open Positions in Germany</h2>
                <p>Browse {jobs.length} opportunities for qualified Kenyan professionals</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {jobs.length === 0 ? (
                <p className="no-jobs">No jobs posted at the moment.</p>
            ) : (
                <>
                    <ul className="job-list">
                        {currentJobs.map((job) => (
                            <li key={job.id} className="job-item">
                                <img
                                    src={job.imageUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'}
                                    alt={job.title}
                                    className="job-image"
                                    onError={(e) => {
                                        if (!e.target.dataset.fallback) {
                                            e.target.src = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop';
                                            e.target.dataset.fallback = true;
                                        }
                                    }}
                                />
                                <div className="job-content">
                                    <h3 className="job-title">{job.title}</h3>
                                    <p className="job-location">
                                        📍 {job.location} {countryFlags[job.location] || ''}
                                    </p>
                                    <p className="job-description">
                                        {job.description.length > 120 ? `${job.description.slice(0, 120)}...` : job.description}
                                    </p>
                                    {/*{job.requirements && (*/}
                                    {/*    <div className="job-requirements">*/}
                                    {/*        <strong>Requirements:</strong>*/}
                                    {/*        <p>{job.requirements}</p>*/}
                                    {/*    </div>*/}
                                    {/*)}*/}
                                    <p className="salary">
                                        💰 {job.salary ? `€${job.salary.toLocaleString()}/year` : 'Not disclosed'}
                                    </p>
                                    <Link
                                        to={`/jobs/${job.id}`}
                                        className="apply-button"
                                        aria-label={`View details and apply for ${job.title}`}
                                    >
                                        View Details & Apply →
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Pagination */}
                    <div className="pagination">
                        <button onClick={handlePrev} disabled={currentPage === 1}>← Previous</button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button onClick={handleNext} disabled={currentPage === totalPages}>Next →</button>
                    </div>
                </>
            )}
        </div>
    );
}
