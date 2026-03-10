import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./Cynthia.css";

export default function Cynthia() {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sendingSms, setSendingSms] = useState({});
    
    const smsTemplates = {
        "Received": (ref) => `Great news! We've received your Germany Jobs application. Your Ref No. is ${ref}. We're excited to assist you! Visit our website anytime to track your progress.`,
        "Review": (ref) => `Your Germany Jobs application (Ref: ${ref}) is currently being reviewed by our team. We'll be in touch soon with the next steps!`,
        "Interview": (ref) => `Congratulations! You've been shortlisted for an interview regarding your Germany Jobs application (Ref: ${ref}). Please check your email for the schedule.`,
        "Approved": (ref) => `Excellent news! Your Germany Jobs application (Ref: ${ref}) has been approved. Please visit our website tracker to select your preferred job role. Welcome aboard!`,
        "Rejected": (ref) => `Thank you for your interest in Germany Jobs. Regarding application ${ref}, we regret to inform you that we won't be moving forward at this time. We wish you the best.`,
        "JobChoice": (ref) => `Congratulations! Your Germany application ${ref} is approved. Please visit our portal now to select your preferred job role from the 500+ available positions. Welcome aboard!`
    };

    const [selectedStages, setSelectedStages] = useState({});

    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {
        try {
            const response = await fetch("/api/get-applicants");
            const data = await response.json();
            
            if (!response.ok) {
                const errorMsg = data.details || data.error || "Unknown error";
                const hint = data.hint ? `\n\nHint: ${data.hint}` : "";
                throw new Error(`${errorMsg}${hint}`);
            }
            
            setApplicants(data);
        } catch (error) {
            console.error("Error loading applicants:", error);
            Swal.fire({
                title: "Load Failed",
                text: error.message,
                icon: "error",
                confirmButtonColor: "#003366"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStageChange = (appNumber, stage) => {
        setSelectedStages(prev => ({ ...prev, [appNumber]: stage }));
    };

    const sendSms = async (phone, applicationNumber, stageOverride = null) => {
        const stage = stageOverride || selectedStages[applicationNumber] || "Received";
        const message = smsTemplates[stage]?.(applicationNumber) || smsTemplates["Received"](applicationNumber);
        
        if (sendingSms[applicationNumber]) return;
        
        setSendingSms(prev => ({ ...prev, [applicationNumber]: true }));

        try {
            const response = await fetch("/api/send-sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, message, stage, applicationNumber })
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: "SMS Sent!",
                    text: `"${stage}" message sent to ${phone}`,
                    icon: "success",
                    confirmButtonColor: "#003366"
                });
                
                setApplicants(prev => prev.map(a => 
                    a.application_number === applicationNumber 
                    ? { ...a, sent_sms_stages: [...(a.sent_sms_stages || []), stage] } 
                    : a
                ));
            } else {
                throw new Error(result.error || "Failed to send SMS");
            }
        } catch (error) {
            console.error("SMS Error:", error);
            Swal.fire("Failed", error.message, "error");
        } finally {
            setSendingSms(prev => ({ ...prev, [applicationNumber]: false }));
        }
    };

    const sendEmailOnly = async (app) => {
        if (sendingSms[app.application_number]) return;
        setSendingSms(prev => ({ ...prev, [app.application_number]: true }));

        try {
            const response = await fetch("/api/send-job-notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: app.email, applicationNumber: app.application_number })
            });

            if (response.ok) {
                Swal.fire("Email Sent!", "Job selection instructions emailed to candidate.", "success");
            } else {
                throw new Error("Failed to send email.");
            }
        } catch (error) {
            Swal.fire("Email Failed", error.message, "error");
        } finally {
            setSendingSms(prev => ({ ...prev, [app.application_number]: false }));
        }
    };

    const sendJobChoiceNotification = async (app) => {
        if (sendingSms[app.application_number]) return;
        
        const result = await Swal.fire({
            title: "Send Job Notification?",
            text: `This will send both an Email and SMS to ${app.phone} nudging them to select a job.`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Yes, Notify Candidate",
            confirmButtonColor: "#003366"
        });

        if (!result.isConfirmed) return;

        setSendingSms(prev => ({ ...prev, [app.application_number]: true }));

        try {
            // 1. Send SMS
            const smsMessage = smsTemplates["JobChoice"](app.application_number);
            const smsPromise = fetch("/api/send-sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: app.phone, message: smsMessage, stage: "JobChoice", applicationNumber: app.application_number })
            });

            // 2. Send Email
            const emailPromise = fetch("/api/send-job-notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: app.email, applicationNumber: app.application_number })
            });

            const [smsRes, emailRes] = await Promise.all([smsPromise, emailPromise]);

            if (smsRes.ok && emailRes.ok) {
                Swal.fire("Nudge Sent!", "Email and SMS successfully dispatched.", "success");
                setApplicants(prev => prev.map(a => 
                    a.application_number === app.application_number 
                    ? { ...a, sent_sms_stages: [...(a.sent_sms_stages || []), "JobChoice"] } 
                    : a
                ));
            } else {
                let errorDetails = "";
                if (!smsRes.ok) errorDetails += "SMS failed to send. ";
                if (!emailRes.ok) {
                    let emailErrText = "";
                    try {
                        const clonedRes = emailRes.clone();
                        const jsonErr = await clonedRes.json().catch(() => null);
                        if (jsonErr) {
                            emailErrText = jsonErr.error || "Unknown error";
                        } else {
                            const htmlText = await emailRes.text();
                            console.error("Server returned non-JSON response:", htmlText);
                            emailErrText = "Server error (Invalid response). Please restart your dev server.";
                        }
                    } catch (e) {
                        emailErrText = "Technical error reading server response.";
                    }
                    errorDetails += `Email failed: ${emailErrText}. `;
                }
                throw new Error(errorDetails);
            }
        } catch (error) {
            Swal.fire({
                title: "Notification Failed",
                text: error.message,
                icon: "error",
                confirmButtonColor: "#003366"
            });
        } finally {
            setSendingSms(prev => ({ ...prev, [app.application_number]: false }));
        }
    };

    const filteredApplicants = applicants
        .filter(app => {
            const safeSearch = (searchTerm || "").toLowerCase();
            return (
                (app.application_number || "").toLowerCase().includes(safeSearch) ||
                (app.phone || "").includes(safeSearch) ||
                (app.email || "").toLowerCase().includes(safeSearch)
            );
        })
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const notifyAllUnderReview = async () => {
        const toNotify = filteredApplicants.filter(app => 
            app.status === "Under Review" && 
            !(app.sent_sms_stages || []).includes("Review")
        );

        if (toNotify.length === 0) {
            Swal.fire("Up to Date", "No pending notifications for 'Under Review' status.", "info");
            return;
        }

        const result = await Swal.fire({
            title: "Bulk Notification",
            text: `Send 'Review' SMS to ${toNotify.length} applicants?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Send All",
            confirmButtonColor: "#003366"
        });

        if (result.isConfirmed) {
            Swal.fire({
                title: "Sending...",
                text: "Please wait while we process the messages.",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            let successCount = 0;
            for (const app of toNotify) {
                try {
                    const message = smsTemplates["Review"](app.application_number);
                    const response = await fetch("/api/send-sms", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                            phone: app.phone, 
                            message, 
                            stage: "Review", 
                            applicationNumber: app.application_number 
                        })
                    });
                    if (response.ok) successCount++;
                } catch (e) {
                    console.error("Batch error for:", app.application_number, e);
                }
            }

            fetchApplicants(); // Refresh list to update history
            Swal.fire("Complete", `Successfully notified ${successCount} applicants.`, "success");
        }
    };

    const notifySingle = async (app) => {
        const statusMap = {
            "Under Review": "Review",
            "Approved": "Approved",
            "Rejected": "Rejected",
            "Interview": "Interview",
            "Shortlisted": "Interview"
        };
        
        const stage = statusMap[app.status] || "Received";
        sendSms(app.phone, app.application_number, stage);
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="header-content">
                    <h1>Cynthia's Dashboard</h1>
                    <p>Manage applications and communications</p>
                </div>
                <div className="header-actions">
                    <button className="bulk-notify-btn" onClick={notifyAllUnderReview}>
                        Notify All Under Review ({filteredApplicants.filter(a => a.status === "Under Review" && !(a.sent_sms_stages || []).includes("Review")).length})
                    </button>
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="Search applicant..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Applications</h3>
                    <p className="stat-number">{applicants.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Pending Review</h3>
                    <p className="stat-number">
                        {applicants.filter(a => a.status === 'Pending Review').length}
                    </p>
                </div>
            </div>

            <div className="applicant-list-card">
                <h2>Applicant List</h2>
                {loading ? (
                    <div className="loading-spinner">Loading applicants...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Ref No.</th>
                                    <th>Contact Info</th>
                                    <th>Applied On</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplicants.map((app) => (
                                    <tr key={app.application_number}>
                                        <td className="ref-no">{app.application_number}</td>
                                        <td>
                                            <div className="contact-info">
                                                <span className="email">{app.email}</span>
                                                <span className="phone">{app.phone}</span>
                                            </div>
                                        </td>
                                        <td>{formatDate(app.created_at)}</td>
                                        <td>
                                            <span className={`status-badge ${app.status?.toLowerCase().replace(" ", "-")}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="sms-control-group">
                                                <select 
                                                    className="stage-selector"
                                                    value={selectedStages[app.application_number] || "Received"}
                                                    onChange={(e) => handleStageChange(app.application_number, e.target.value)}
                                                >
                                                    {Object.keys(smsTemplates).map(stage => (
                                                        <option key={stage} value={stage}>{stage}</option>
                                                    ))}
                                                </select>
                                                
                                                <button 
                                                    className="send-sms-btn"
                                                    onClick={() => sendSms(app.phone, app.application_number)}
                                                    disabled={
                                                        sendingSms[app.application_number] || 
                                                        (app.sent_sms_stages || []).includes(selectedStages[app.application_number] || "Received")
                                                    }
                                                >
                                                    {sendingSms[app.application_number] ? "Sending..." : "Send SMS"}
                                                </button>
                                                
                                                <button 
                                                    className="quick-notify-btn"
                                                    onClick={() => notifySingle(app)}
                                                    title={`Notify as ${app.status}`}
                                                    disabled={sendingSms[app.application_number]}
                                                >
                                                    📢 Notify Status
                                                </button>

                                                {app.status === "Approved" && !app.selected_job && (
                                                    <div className="approved-specific-actions">
                                                        <button 
                                                            className="send-email-btn"
                                                            onClick={() => sendEmailOnly(app)}
                                                            title="Send Job Selection Email"
                                                            disabled={sendingSms[app.application_number]}
                                                        >
                                                            📧 Email Job Info
                                                        </button>
                                                        <button 
                                                            className="nudge-job-btn"
                                                            onClick={() => sendJobChoiceNotification(app)}
                                                            title="Send both Email and SMS"
                                                            disabled={sendingSms[app.application_number]}
                                                        >
                                                            🎯 Nudge All
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            {app.sent_sms_stages && app.sent_sms_stages.length > 0 && (
                                                <div className="sent-history">
                                                    Sent: {app.sent_sms_stages.join(", ")}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredApplicants.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="empty-state">No applicants found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
