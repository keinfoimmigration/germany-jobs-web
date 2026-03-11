import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "./ConfirmPlacement.css";

const ConfirmPlacement = () => {
    const [searchParams] = useSearchParams();
    const ref = searchParams.get("ref");
    const [loading, setLoading] = useState(true);
    const [application, setApplication] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!ref) {
            setError("Invalid confirmation link. Missing application reference.");
            setLoading(false);
            return;
        }

        const processConfirmation = async () => {
            try {
                // 1. Fetch current data first to prevent duplicate processing
                const { data: currentData, error: initialFetchError } = await supabase
                    .from("applications")
                    .select("*")
                    .eq("application_number", ref)
                    .single();

                if (initialFetchError) throw initialFetchError;

                // If already confirmed, just show success directly
                if (currentData.status === "Visa processing in progress" && currentData.sent_sms_stages?.includes("OfferAccepted")) {
                    setApplication(currentData);
                    setSuccess(true);
                    return;
                }

                // 2. Update status and tracking info in database
                const { error: updateError } = await supabase
                    .from("applications")
                    .update({ 
                        status: "Visa processing in progress",
                        last_sms_stage: "OfferAccepted",
                        last_sms_at: new Date().toISOString()
                    })
                    .eq("application_number", ref);

                if (updateError) throw updateError;

                // 3. Append to SMS stage history
                try {
                    // Only append if it doesn't already have it (just in case)
                    if (!currentData.sent_sms_stages?.includes('OfferAccepted')) {
                        await supabase.rpc('append_sms_stage', { 
                            applicant_phone: currentData.phone, 
                            new_stage: 'OfferAccepted' 
                        });
                    }
                } catch (rpcErr) {
                    console.warn("RPC history update failed:", rpcErr);
                }

                // 4. Fetch the final updated data to display
                const { data: updatedData, error: finalFetchError } = await supabase
                    .from("applications")
                    .select("*")
                    .eq("application_number", ref)
                    .single();

                if (finalFetchError) throw finalFetchError;

                setApplication(updatedData);
                setSuccess(true);
            } catch (err) {
                console.error("Confirmation error:", err);
                setError("Failed to process your confirmation. Please contact support.");
            } finally {
                setLoading(false);
            }
        };

        processConfirmation();
    }, [ref]);

    if (loading) {
        return (
            <div className="confirm-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Processing your official confirmation...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="confirm-container">
                <div className="error-card">
                    <div className="error-icon">⚠️</div>
                    <h2>Confirmation Issue</h2>
                    <p>{error}</p>
                    <Link to="/checkstatus" className="primary-btn">Go to Tracking Page</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="confirm-container">
            <div className="celebration-hero">
                <div className="confetti-emoji">🎉 ✨ 🎊</div>
                <h1 className="congrats-text">CONGRATULATIONS!</h1>
            </div>

            <div className="success-page-container">
                <div className="success-card-header">
                    <div className="success-icon-large">✅</div>
                    <h2 className="success-header">OFFER OFFICIALLY ACCEPTED</h2>
                    <p className="success-sub-header">Reference #: <strong>{application?.application_number}</strong></p>
                </div>
                
                <div className="success-instructions-card">
                    <div className="confirmation-banner">
                        <p>Your acceptance has been securely transmitted and recorded in the <strong>Federal Bureau of Immigration</strong> database.</p>
                    </div>

                    <h3>Your Next Strategic Steps:</h3>
                    <p>We have officially initiated your <strong>Visa Processing protocol</strong> with the German Federal Authorities for your role as <strong>{application?.selected_sub_job}</strong>.</p>
                    
                    <div className="doc-checklist-box">
                        <h4>Immediate Document Preparation:</h4>
                        <p className="checklist-intro">Please ensure you have the following original documents ready for your regional appointment:</p>
                        <ul>
                            <li><strong>Original National ID Card</strong> (Biometric verification)</li>
                            <li><strong>Professional Certifications</strong> (Originals & Certified Copies)</li>
                            <li><strong>International Passport</strong> (Validity must be at least 12 months)</li>
                            <li><strong>Official Placement Letter</strong> (The PDF sent to your email)</li>
                        </ul>
                    </div>
                    
                    <div className="timeline-alert">
                         <span className="alert-icon">📅</span>
                         <p>Our regional coordination office will contact you via <strong>Email and SMS</strong> within the next 48-72 hours guiding you on the visa application.</p>
                    </div>
                </div>

                <div className="success-footer">
                    <Link to="/checkstatus" className="secondary-btn">
                        Open My Status Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPlacement;
