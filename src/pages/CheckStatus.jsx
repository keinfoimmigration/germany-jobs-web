import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import QRCode from "qrcode";
import bwipjs from "bwip-js";
import "./CheckStatus.css";

const germanyJobs = {
    "Healthcare & Medical": [
        "Registered Nurse",
        "Geriatric Care Specialist (Elderly Care)",
        "Pediatric Nurse",
        "Physical Therapist",
        "Nursing Assistant",
        "Medical Laboratory Technician",
        "Radiology Assistant",
        "Dental Assistant",
        "Emergency Medical Technician"
    ],
    "Education & Social Work": [
        "Primary School Teacher",
        "Secondary School Teacher",
        "Vocational Instructor",
        "Early Childhood Educator",
        "Social Worker",
        "Special Needs Educator",
        "Language Instructor (German/English)"
    ],
    "Engineering & Technical": [
        "Mechanical Engineer",
        "Electrical Engineer",
        "Civil Engineer",
        "Industrial Technician",
        "Auto Mechanic / Mechatronics",
        "CAD Designer",
        "Quality Assurance Inspector",
        "Software Developer"
    ],
    "Transport & Logistics": [
        "Long-haul Truck Driver (CE License)",
        "Delivery Van Driver",
        "Warehouse Supervisor",
        "Forklift Operator",
        "Logistics Coordinator",
        "Fleet Manager",
        "Public Transport Driver"
    ],
    "Construction & Trades": [
        "Electrician",
        "Plumber",
        "Mason / Bricklayer",
        "Carpenter",
        "HVAC Technician",
        "Welder (MIG/TIG)",
        "Painter & Decorator",
        "Roofing Specialist",
        "Scaffold Builder"
    ],
    "Hospitality & Gastronomy": [
        "Chef / Specialty Cook",
        "Kitchen Assistant",
        "Hotel Housekeeper",
        "Waiter / Waitress",
        "Front Desk Receptionist",
        "Pastry Chef / Baker",
        "Restaurant Manager"
    ],
    "Agriculture & Environment": [
        "Farm Manager",
        "Seasonal Farm Worker",
        "Agricultural Technician",
        "Greenhouse Specialist",
        "Landscaping Gardener",
        "Forestry Worker"
    ],
    "General Services": [
        "Industrial Cleaner",
        "Security Guard",
        "Office Assistant",
        "Facility Maintenance Worker",
        "Laundry & Textile Care",
        "Delivery Courier"
    ]
};

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

    // Job Selection State
    const [showJobModal, setShowJobModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState("");
    const [selectedSubJob, setSelectedSubJob] = useState("");
    const [jobRemarks, setJobRemarks] = useState("");
    const [jobSaving, setJobSaving] = useState(false);
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
            .from("applications")
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

    const generateReceipt = async () => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const receiptNo = `RCPT-${application.application_number}-${Math.floor(Math.random() * 9000) + 1000}`;

        // 1. Generate Codes first (Async)
        let qrDataUrl = "";
        let barcodeDataUrl = "";
        try {
            // QR links to verification page
            qrDataUrl = await QRCode.toDataURL(`https://kenyagermany-jobs.vercel.app/checkstatus?ref=${application.application_number}`);
            
            // Barcode represents the receipt number
            const canvas = document.createElement('canvas');
            bwipjs.toCanvas(canvas, {
                bcid: 'code128',
                text: receiptNo,
                scale: 3,
                height: 10,
                includetext: true,
                textxalign: 'center',
            });
            barcodeDataUrl = canvas.toDataURL('image/png');
        } catch (e) {
            console.error("Code generation failed", e);
        }

        // 2. Background & Borders
        doc.setFillColor(252, 252, 248);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        doc.setDrawColor(0, 51, 102);
        doc.setLineWidth(1);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // 3. Header
        doc.setTextColor(0, 51, 102);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("GERMANY JOBS IMMIGRATION", pageWidth / 2, 25, { align: "center" });
        doc.setFontSize(14);
        doc.text("OFFICIAL PAYMENT RECEIPT", pageWidth / 2, 33, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(25, 38, pageWidth - 25, 38);

        // 4. Content Layout (Two Columns)
        const leftX = 30;
        const rightX = pageWidth / 2 + 10;
        let currentY = 55;
        const spacing = 10;

        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);

        // Left Column - Details
        const details = [
            ["Receipt Number:", receiptNo],
            ["Date Issued:", new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })],
            ["Applicant Name:", application.email],
            ["Application No:", application.application_number],
            ["Payment Description:", "Visa Processing & Verification Fee"],
            ["M-Pesa Transaction:", mpesaCode || application.mpesa_code || "VERIFIED"],
            ["Total Amount Paid:", "Ksh 6,500.00"]
        ];

        details.forEach((item) => {
            doc.setFont("helvetica", "bold");
            doc.text(item[0], leftX, currentY);
            doc.setFont("helvetica", "normal");
            doc.text(item[1], leftX + 50, currentY);
            currentY += spacing;
        });

        // Right Column - Visual Codes & Verification
        if (qrDataUrl) {
            doc.addImage(qrDataUrl, 'PNG', rightX + 20, 55, 40, 40);
            doc.setFontSize(9);
            doc.text("Scan to Verify Status", rightX + 40, 98, { align: "center" });
        }

        if (barcodeDataUrl) {
            doc.addImage(barcodeDataUrl, 'PNG', rightX + 5, 115, 70, 25);
        }

        // 5. Institutional Seal / Watermark (Optional but nice)
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        doc.setFontSize(60);
        doc.text("OFFICIAL PAID", pageWidth / 2, pageHeight / 2 + 20, { align: "center", angle: 30 });
        doc.restoreGraphicsState();

        // 6. Footer
        doc.setDrawColor(200, 200, 200);
        doc.line(30, pageHeight - 35, pageWidth - 30, pageHeight - 35);
        
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text("Support: keinfoimmigration@gmail.com | WhatsApp: +254 737 872 584", pageWidth / 2, pageHeight - 25, { align: "center" });
        doc.setFontSize(8);
        doc.text("This document is an electronic receipt and remains valid without a physical signature.", pageWidth / 2, pageHeight - 20, { align: "center" });

        // Save & Return
        doc.save(`Receipt_${application.application_number}.pdf`);
        return doc.output('datauristring');
    };

    // Submit visa processing fee
    const submitVisaFee = async () => {
        if (!paymentVerified) return setModalError("Please verify your payment first.");

        // Double-check payment in DB
        const { data: paymentData, error: paymentError } = await supabase
            .from("applications")
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
                status: "Visa Processing",
                mpesa_code: mpesaCode
            })
            .eq("application_number", application.application_number);

        if (error) setModalError("Failed to save payment details. Try again.");
        else {
            setApplication({
                ...application,
                status: "Visa Processing",
                mpesa_code: mpesaCode
            });

            // Close modal and show toast immediately
            setShowModal(false);
            setSuccessMessage(`✅ Visa processing fee successfully paid. Processing documents...`);

            // 1. Generate PDF & Local Download
            const pdfBase64 = await generateReceipt();

            // 2. Send Notifications in background (avoid blocking UI)
            try {
                // Email Receipt
                fetch("/api/send-receipt-pdf", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        pdfBase64, 
                        email: application.email, 
                        applicationNumber: application.application_number 
                    })
                }).catch(err => console.error("Email notify failed", err));

                // SMS Notification
                const smsMessage = `Payment Received! We have successfully received your Visa Processing Fee of Ksh 6,500 for application Ref: ${application.application_number}. Your official receipt has been sent to your email. Thank you!`;
                fetch("/api/send-sms", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        phone: application.phone, 
                        message: smsMessage, 
                        stage: "PaymentReceived", 
                        applicationNumber: application.application_number 
                    })
                }).catch(err => console.error("SMS notify failed", err));

            } catch (notifyErr) {
                console.warn("Notifications background error", notifyErr);
            }

            setTimeout(() => setSuccessMessage(""), 5000); // Toast auto-hide

            // Reset modal state
            setPaymentVerified(false); setMpesaCode("");
            setModalError(""); setModalSuccess("");
        }
    };

    // Submit job selection
    const submitJobSelection = async () => {
        if (!selectedJob || !selectedSubJob) {
            Swal.fire("Incomplete Selection", "Please select both a job category and a specific role.", "warning");
            return;
        }

        setJobSaving(true);
        const { error } = await supabase
            .from("applications")
            .update({
                selected_job: selectedJob,
                selected_sub_job: selectedSubJob,
                job_remarks: jobRemarks
            })
            .eq("application_number", application.application_number);

        setJobSaving(false);

        if (error) {
            Swal.fire("Error", "Failed to save job selection. Please try again.", "error");
        } else {
            setApplication({
                ...application,
                selected_job: selectedJob,
                selected_sub_job: selectedSubJob,
                job_remarks: jobRemarks
            });
            setShowJobModal(false);
            Swal.fire({
                title: "Selection Saved!",
                text: "Your job preference has been recorded successfully.",
                icon: "success",
                confirmButtonColor: "#003366"
            });
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Submitted": return "status-badge status-submitted";
            case "Pending Review": return "status-badge status-pending";
            case "Under Review": return "status-badge status-under-review";
            case "Interview Scheduled": return "status-badge status-interview";
            case "Interview Confirmed": return "status-badge status-approved";
            case "Visa Processing": return "status-badge status-approved";
            case "Approved": return "status-badge status-approved";
            case "Rejected": return "status-badge status-rejected";
            case "On Hold": return "status-badge status-onhold";
            case "Visa processing in progress": return "status-badge status-visa";
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
                    Enter your Application Number or Mobile Number to view your application and proceed with your visa processing fee.
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
                                    <div className="grid-item status-item">
                                        <h4>Status</h4>
                                        <div className="status-flex">
                                            <p className={getStatusClass(application.status)}>{application.status}</p>
                                            {application.status === "Approved" && (
                                                <button className="primary-btn select-job-btn-mini" onClick={() => setShowJobModal(true)}>
                                                    Select Job
                                                </button>
                                            )}
                                            {(application.status === "Interview Scheduled" || application.status === "Visa processing in progress") && (
                                                <button className="primary-btn select-job-btn-mini" onClick={() => setShowModal(true)}>
                                                    Pay Visa Processing Fee
                                                </button>
                                            )}
                                            {application.status === "Visa Processing" && (
                                                <button className="secondary-btn select-job-btn-mini" onClick={generateReceipt}>
                                                    🧾 Download Receipt
                                                </button>
                                            )}
                                        </div>
                                        {application.selected_job && (
                                            <div className="selection-badge">
                                                Selected: {application.selected_sub_job}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid-item"><h4>Email</h4><p>{application.email}</p></div>
                                    <div className="grid-item"><h4>Phone</h4><p>{application.phone}</p></div>
                                    <div className="grid-item"><h4>Submitted On</h4><p>{new Date(application.created_at).toLocaleDateString()}</p></div>
                                    {application.interview_date && <div className="grid-item"><h4>Interview Date</h4><p>{application.interview_date}</p></div>}
                                    {application.interview_time && <div className="grid-item"><h4>Interview Time</h4><p>{application.interview_time}</p></div>}
                                </div>

                            </>
                        )}
                    </section>

            {/* Modal */}
            {showModal && (
                <div className="payment-modal" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <h3>Pay Visa Processing Fee</h3>
                        <p className="modal-instruction">
                            1. Pay the Visa Processing fee of Ksh 6,500 to till number 5231486.<br />
                            2. Enter your M-Pesa transaction code and verify.<br />
                            3. Submit your payment to confirm.
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

                        {/* Removed Date & Time inputs */}

                        {modalError && <div className="error-message">{modalError}</div>}
                        {modalSuccess && <div className="success-message">{modalSuccess}</div>}

                        <div className="modal-buttons">
                            <button
                                className="secondary-btn"
                                onClick={() => {
                                    setShowModal(false);
                                    setPaymentVerified(false);
                                    setMpesaCode("");
                                    setModalError("");
                                    setModalSuccess("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="primary-btn"
                                onClick={submitVisaFee}
                                disabled={!paymentVerified}
                            >
                                Submit Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Job Selection Modal */}
            {showJobModal && (
                <div className="job-selection-modal" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <header className="modal-header">
                            <h3>Select Your Preferred Role</h3>
                            <button className="close-modal" onClick={() => setShowJobModal(false)}>&times;</button>
                        </header>
                        
                        <div className="modal-body">
                            <div className="vacancy-banner">
                                <span className="vacancy-icon">📢</span>
                                <strong>100+ Vacant Positions Available Immediately</strong>
                            </div>
                            <p className="modal-instruction">
                                Select a category and role to proceed with your placement in Germany.
                            </p>

                            <div className="form-group">
                                <label>Job Category</label>
                                <select 
                                    value={selectedJob} 
                                    onChange={(e) => {
                                        setSelectedJob(e.target.value);
                                        setSelectedSubJob("");
                                    }}
                                >
                                    <option value="">-- Select Category --</option>
                                    {Object.keys(germanyJobs).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Specific Role (Sub-Job)</label>
                                <select 
                                    value={selectedSubJob} 
                                    onChange={(e) => setSelectedSubJob(e.target.value)}
                                    disabled={!selectedJob}
                                >
                                    <option value="">-- Select Position --</option>
                                    {selectedJob && germanyJobs[selectedJob].map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Remarks (Max 250 characters)</label>
                                <textarea
                                    placeholder="Add any additional information or specific preferences..."
                                    value={jobRemarks}
                                    onChange={(e) => setJobRemarks(e.target.value.slice(0, 250))}
                                    rows="4"
                                />
                                <small className="char-count">{jobRemarks.length}/250</small>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="secondary-btn" onClick={() => setShowJobModal(false)}>Cancel</button>
                            <button 
                                className="primary-btn" 
                                onClick={submitJobSelection}
                                disabled={jobSaving || !selectedJob || !selectedSubJob}
                            >
                                {jobSaving ? "Saving..." : "Submit Selection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}