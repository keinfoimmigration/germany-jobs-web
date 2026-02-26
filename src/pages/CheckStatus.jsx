import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import "./CheckStatus.css";

export default function CheckStatus() {
    const [searchInput, setSearchInput] = useState("");
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(""); // Toast message

    const [showModal, setShowModal] = useState(false);
    const [interviewDate, setInterviewDate] = useState("");
    const [interviewTime, setInterviewTime] = useState("");
    const [mpesaCode, setMpesaCode] = useState("");
    const [paymentVerified, setPaymentVerified] = useState(false);
    const [modalError, setModalError] = useState("");
    const [modalSuccess, setModalSuccess] = useState("");

    const tillNumber = "4139224"; // Replace with actual till number

    // Check application status
    const checkStatus = async () => {
        if (!searchInput.trim()) return setError("Please enter Application Number or Mobile Number.");
        setLoading(true); setError(""); setApplication(null); setSuccessMessage("");

        const { data, error } = await supabase
            .from("applications")
            .select("*")
            .or(`application_number.eq.${searchInput},phone.eq.${searchInput}`)
            .single();

        if (error) setError(`Database error: ${error.message}`);
        else if (!data) setError("No application found with that Application Number or Mobile Number.");
        else setApplication(data);

        setLoading(false);
    };

    // Verify M-Pesa payment
    const verifyPayment = async () => {
        if (!mpesaCode.trim()) return setModalError("Please enter the M-Pesa transaction code.");
        setModalError(""); setModalSuccess("");

        const { data, error } = await supabase
            .from("payments")
            .select("*")
            .eq("application_number", application.application_number)
            .eq("mpesa_code", mpesaCode)
            .single();

        if (error || !data) {
            setModalError("Payment verification failed. Check your M-Pesa code.");
            setPaymentVerified(false);
        } else {
            setPaymentVerified(true);
            setModalSuccess("Payment successfully verified ✅");
        }
    };

    // Submit interview booking
    const submitInterviewBooking = async () => {
        if (!paymentVerified) return setModalError("Please verify your payment first.");
        if (!interviewDate || !interviewTime) return setModalError("Select interview date and time.");

        // Double-check payment in DB
        const { data: paymentData, error: paymentError } = await supabase
            .from("payments")
            .select("*")
            .eq("application_number", application.application_number)
            .eq("mpesa_code", mpesaCode)
            .single();

        if (paymentError || !paymentData) {
            setModalError("Payment verification failed on server. Cannot submit.");
            setPaymentVerified(false); return;
        }

        const { error } = await supabase
            .from("applications")
            .update({
                interview_date: interviewDate,
                interview_time: interviewTime,
                status: "Interview Confirmed",
                mpesa_code: mpesaCode
            })
            .eq("application_number", application.application_number);

        if (error) setModalError("Failed to save interview details. Try again.");
        else {
            setApplication({
                ...application,
                status: "Interview Confirmed",
                interview_date: interviewDate,
                interview_time: interviewTime
            });

            // Close modal and show toast
            setShowModal(false);
            setSuccessMessage(`✅ Interview successfully booked for ${interviewDate} at ${interviewTime}.`);
            setTimeout(() => setSuccessMessage(""), 4000); // Toast auto-hide

            // Reset modal state
            setPaymentVerified(false); setMpesaCode(""); setInterviewDate(""); setInterviewTime("");
            setModalError(""); setModalSuccess("");
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Submitted": return "status-badge status-submitted";
            case "Pending Review": return "status-badge status-pending";
            case "Under Review": return "status-badge status-under-review";
            case "Interview Scheduled": return "status-badge status-interview";
            case "Interview Confirmed": return "status-badge status-approved";
            case "Approved": return "status-badge status-approved";
            case "Rejected": return "status-badge status-rejected";
            case "On Hold": return "status-badge status-onhold";
            default: return "status-badge status-other";
        }
    };

    return (
        <div className="check-status">
            {/* Toast */}
            {successMessage && <div className="toast-notification">{successMessage}</div>}

            <header className="check-status-header">
                <h2>Track Application</h2>
                <p className="instruction-text">
                    Enter your Application Number or Mobile Number to view your application and, if scheduled, book your interview.
                </p>
            </header>

            <section className="status-card">
                <div className="form-group">
                    <label htmlFor="searchInput">Application Number or Mobile Number</label>
                    <input
                        id="searchInput"
                        type="text"
                        placeholder="e.g. GK-2026-123456 or +254700000000"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>

                <button className="primary-btn" onClick={checkStatus} disabled={loading}>
                    {loading ? "Searching..." : "Check Status"}
                </button>

                {error && <div className="error-message">{error}</div>}

                {application && (
                    <>
                        <div className="application-grid">
                            <div className="grid-item"><h4>Application Number</h4><p>{application.application_number}</p></div>
                            <div className="grid-item"><h4>Status</h4><p className={getStatusClass(application.status)}>{application.status}</p></div>
                            <div className="grid-item"><h4>Email</h4><p>{application.email}</p></div>
                            <div className="grid-item"><h4>Phone</h4><p>{application.phone}</p></div>
                            <div className="grid-item"><h4>Submitted On</h4><p>{new Date(application.created_at).toLocaleDateString()}</p></div>
                            {application.interview_date && <div className="grid-item"><h4>Interview Date</h4><p>{application.interview_date}</p></div>}
                            {application.interview_time && <div className="grid-item"><h4>Interview Time</h4><p>{application.interview_time}</p></div>}
                        </div>

                        {application.status === " " && (
                            <button className="primary-btn" onClick={() => setShowModal(true)}>
                                Book Interview
                            </button>
                        )}
                    </>
                )}
            </section>

            {/* Modal */}
            {showModal && (
                <div className="payment-modal" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <h3>Book Your Interview</h3>
                        <p className="modal-instruction">
                            1. Pay Ksh 1,000 via M-Pesa to Till Number: <strong>{tillNumber}</strong>.<br />
                            2. Enter your M-Pesa transaction code and verify.<br />
                            3. Select your preferred interview date and time.<br />
                            4. Submit your booking to confirm.
                        </p>

                        {/* Payment Verification */}
                        <div className="payment-box">
                            <input
                                type="text"
                                placeholder="Enter M-Pesa Code"
                                value={mpesaCode}
                                onChange={(e) => setMpesaCode(e.target.value)}
                                disabled={paymentVerified}
                            />
                            <button
                                className="primary-btn"
                                onClick={verifyPayment}
                                disabled={paymentVerified}
                            >
                                {paymentVerified ? "Payment Verified ✅" : "Verify Payment"}
                            </button>
                        </div>

                        {/* Date & Time */}
                        <label>Date</label>
                        <input
                            type="date"
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                            disabled={!paymentVerified}
                        />

                        <label>Time</label>
                        <input
                            type="time"
                            value={interviewTime}
                            onChange={(e) => setInterviewTime(e.target.value)}
                            disabled={!paymentVerified}
                        />

                        {modalError && <div className="error-message">{modalError}</div>}
                        {modalSuccess && <div className="success-message">{modalSuccess}</div>}

                        <div className="modal-buttons">
                            <button
                                className="secondary-btn"
                                onClick={() => {
                                    setShowModal(false);
                                    setPaymentVerified(false);
                                    setMpesaCode("");
                                    setInterviewDate("");
                                    setInterviewTime("");
                                    setModalError("");
                                    setModalSuccess("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="primary-btn"
                                onClick={submitInterviewBooking}
                                disabled={!paymentVerified}
                            >
                                Submit Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}