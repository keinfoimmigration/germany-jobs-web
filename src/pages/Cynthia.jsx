import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
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

    const jobPartnerMapping = {
        "Healthcare & Medical": {
            "Registered Nurse": { company: "Vivantes Healthcare Group", salary: "€2,850 - €3,400" },
            "Geriatric Care Specialist (Elderly Care)": { company: "Alloheim Senioren-Residenzen", salary: "€2,600 - €3,100" },
            "Pediatric Nurse": { company: "Charité - Universitätsmedizin Berlin", salary: "€2,900 - €3,500" },
            "Physical Therapist": { company: "VAMED Gesundheit Holding", salary: "€2,400 - €2,950" },
            "Nursing Assistant": { company: "Korian Deutschland", salary: "€2,100 - €2,550" },
            "Medical Laboratory Technician": { company: "Synlab International GmbH", salary: "€2,500 - €3,100" },
            "Radiology Assistant": { company: "Helios Kliniken GmbH", salary: "€2,650 - €3,200" },
            "Dental Assistant": { company: "AllDent Zahnzentrum", salary: "€2,200 - €2,750" },
            "Emergency Medical Technician": { company: "Deutsches Rotes Kreuz (DRK)", salary: "€2,450 - €2,900" }
        },
        "Transport & Logistics": {
            "Long-haul Truck Driver (CE License)": { company: "DHL Freight Germany", salary: "€2,600 - €3,200" },
            "Delivery Van Driver": { company: "Hermes Germany GmbH", salary: "€2,150 - €2,550" },
            "Warehouse Supervisor": { company: "Kühne + Nagel KG", salary: "€2,700 - €3,300" },
            "Forklift Operator": { company: "DB Schenker Logistics", salary: "€2,250 - €2,650" },
            "Logistics Coordinator": { company: "Dachser SE", salary: "€2,550 - €3,150" },
            "Fleet Manager": { company: "Rhenus Logistics", salary: "€3,200 - €4,100" },
            "Public Transport Driver": { company: "Deutsche Bahn Connect", salary: "€2,400 - €2,900" }
        },
        "Hospitality & Gastronomy": {
            "Chef / Specialty Cook": { company: "Marriott International Germany", salary: "€2,650 - €3,250" },
            "Kitchen Assistant": { company: "LSG Sky Chefs", salary: "€2,050 - €2,400" },
            "Hotel Housekeeper": { company: "H-Hotels AG", salary: "€2,000 - €2,350" },
            "Waiter / Waitress": { company: "Steigenberger Hotels & Resorts", salary: "€2,100 - €2,500" },
            "Front Desk Receptionist": { company: "Motel One Group", salary: "€2,200 - €2,650" },
            "Pastry Chef / Baker": { company: "Kamps GmbH", salary: "€2,350 - €2,850" },
            "Restaurant Manager": { company: "McDonald's Deutschland LLC", salary: "€3,000 - €3,800" }
        },
        "Engineering & Technical": {
            "Mechanical Engineer": { company: "Siemens AG", salary: "€4,200 - €5,500" },
            "Electrical Engineer": { company: "Bosch Group Germany", salary: "€4,150 - €5,400" },
            "Civil Engineer": { company: "HOCHTIEF Solutions AG", salary: "€4,000 - €5,200" },
            "Industrial Technician": { company: "ThyssenKrupp AG", salary: "€2,900 - €3,600" },
            "Auto Mechanic / Mechatronics": { company: "Volkswagen AG", salary: "€2,800 - €3,450" },
            "CAD Designer": { company: "Bentley Systems Germany", salary: "€3,100 - €3,900" },
            "Quality Assurance Inspector": { company: "TÜV SÜD AG", salary: "€3,300 - €4,200" },
            "Software Developer": { company: "SAP SE", salary: "€4,500 - €6,200" }
        },
        "Education & Social Work": {
            "Primary School Teacher": { company: "Public Schools of Munich", salary: "€3,400 - €4,200" },
            "Secondary School Teacher": { company: "Berlin Senate Education", salary: "€3,600 - €4,500" },
            "Vocational Instructor": { company: "IHK FOSA", salary: "€3,200 - €4,000" },
            "Early Childhood Educator": { company: "Fröbel Bildung & Erziehung", salary: "€2,800 - €3,400" },
            "Social Worker": { company: "Caritas Deutschland", salary: "€3,000 - €3,700" },
            "Special Needs Educator": { company: "Lebenshilfe e.V.", salary: "€3,100 - €3,850" },
            "Language Instructor (German/English)": { company: "Berlitz Deutschland GmbH", salary: "€2,400 - €3,000" }
        },
        "Construction & Trades": {
            "Electrician": { company: "SPIE Deutschland & Zentraleuropa", salary: "€2,750 - €3,350" },
            "Plumber": { company: "Hansgrohe SE", salary: "€2,650 - €3,250" },
            "Mason / Bricklayer": { company: "STRABAG AG Germany", salary: "€2,700 - €3,300" },
            "Carpenter": { company: "Weberhaus GmbH", salary: "€2,600 - €3,150" },
            "HVAC Technician": { company: "Viessmann Werke GmbH", salary: "€2,850 - €3,500" },
            "Welder (MIG/TIG)": { company: "Linde Engineering", salary: "€2,900 - €3,650" },
            "Painter & Decorator": { company: "Sto SE & Co. KGaA", salary: "€2,400 - €2,900" },
            "Roofing Specialist": { company: "Braas GmbH", salary: "€2,750 - €3,400" },
            "Scaffold Builder": { company: "PERI SE", salary: "€2,550 - €3,100" }
        },
        "Agriculture & Environment": {
            "Farm Manager": { company: "KWS SAAT SE & Co. KGaA", salary: "€3,500 - €4,500" },
            "Seasonal Farm Worker": { company: "Bayer CropScience AG", salary: "€2,100 - €2,450" },
            "Agricultural Technician": { company: "CLAAS Gruppe", salary: "€2,650 - €3,300" },
            "Greenhouse Specialist": { company: "Landgard Service GmbH", salary: "€2,300 - €2,850" },
            "Landscaping Gardener": { company: "Galabau Deutschland", salary: "€2,400 - €2,950" },
            "Forestry Worker": { company: "HessenForst", salary: "€2,500 - €3,100" }
        },
        "General Services": {
            "Industrial Cleaner": { company: "Wisag Gebäudereinigung", salary: "€2,100 - €2,450" },
            "Security Guard": { company: "Securitas Germany", salary: "€2,200 - €2,650" },
            "Office Assistant": { company: "Adecco Germany", salary: "€2,300 - €2,800" },
            "Facility Maintenance Worker": { company: "Apleona HSG", salary: "€2,450 - €3,000" },
            "Laundry & Textile Care": { company: "MEWA Textil-Service", salary: "€2,050 - €2,400" },
            "Delivery Courier": { company: "DPD Deutschland", salary: "€2,100 - €2,500" }
        }
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
            let smsSuccess = false;
            try {
                const smsMessage = smsTemplates["JobChoice"](app.application_number);
                const smsRes = await fetch("/api/send-sms", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone: app.phone, message: smsMessage, stage: "JobChoice", applicationNumber: app.application_number })
                });
                if (smsRes.ok) smsSuccess = true;
            } catch (err) { console.warn("SMS failed", err); }

            // 2. Send Email
            let emailSuccess = false;
            let emailErrText = "";
            try {
                const emailRes = await fetch("/api/send-job-notify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: app.email, applicationNumber: app.application_number, phone: app.phone })
                });

                if (emailRes.ok) {
                    emailSuccess = true;
                } else {
                    const jsonErr = await emailRes.json().catch(() => ({ error: "Server error" }));
                    emailErrText = jsonErr.error || "Unknown error";
                }
            } catch (err) { emailErrText = err.message; }

            if (smsSuccess && emailSuccess) {
                Swal.fire("Success!", "Candidate notified via both SMS and Email.", "success");
            } else if (smsSuccess && !emailSuccess) {
                Swal.fire({
                    title: "SMS Sent, Email Failed",
                    text: `SMS dispatched successfully, but email failed: ${emailErrText}.`,
                    icon: "warning",
                    confirmButtonColor: "#f59e0b"
                });
            } else if (!smsSuccess && emailSuccess) {
                Swal.fire({
                    title: "Email Sent, SMS Failed",
                    text: "Email dispatched successfully, but the SMS service returned an error.",
                    icon: "warning",
                    confirmButtonColor: "#f59e0b"
                });
            } else {
                throw new Error(`Both notification methods failed. Email error: ${emailErrText}`);
            }

            if (smsSuccess) {
                setApplicants(prev => prev.map(a => 
                    a.application_number === app.application_number 
                    ? { ...a, sent_sms_stages: [...(a.sent_sms_stages || []), "JobChoice"] } 
                    : a
                ));
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

    const generateAndSendOfficialPDF = async (app) => {
        if (sendingSms[app.application_number]) return;

        const result = await Swal.fire({
            title: "Generate Official Document?",
            text: `This will create a professional PDF for ${app.application_number} and send it to ${app.email}.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Generate & Send",
            confirmButtonColor: "#059669"
        });

        if (!result.isConfirmed) return;

        setSendingSms(prev => ({ ...prev, [app.application_number]: true }));
        
        Swal.fire({
            title: "Generating Document...",
            text: "Creating official PDF with stamps and signatures.",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // 0. Background Color (Subtle Cream/Official Paper tint)
            doc.setFillColor(252, 252, 248);
            doc.rect(0, 0, pageWidth, pageHeight, "F");

            // 1. Boundary / Border (Double line for official look)
            doc.setDrawColor(0, 51, 102);
            doc.setLineWidth(1.5);
            doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Outer
            doc.setLineWidth(0.5);
            doc.rect(12, 12, pageWidth - 24, pageHeight - 24); // Inner

            // 1. Watermark (Diagonal and Repeating)
            doc.setTextColor(220, 220, 220);
            doc.setFontSize(45);
            doc.setFont("helvetica", "bold");
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.15 }));
            const watermarkText = "AUTHENTIC OFFICIAL DOCUMENT";
            doc.text(watermarkText, pageWidth / 2, pageHeight / 2, { angle: 45, align: "center" });
            doc.text(watermarkText, pageWidth / 2, pageHeight / 4, { angle: 45, align: "center" });
            doc.text(watermarkText, pageWidth / 2, (pageHeight / 4) * 3, { angle: 45, align: "center" });
            doc.restoreGraphicsState();

            // 2. Header / Branding
            const logoImg = new Image();
            logoImg.src = "/germany-federal-logo.png";
            
            // Wait for logo to load
            await new Promise(r => {
                logoImg.onload = r;
                logoImg.onerror = r;
            });

            try {
                doc.addImage(logoImg, 'PNG', pageWidth / 2 - 15, 10, 30, 30);
            } catch (e) { console.warn("Logo failed"); }

            doc.setTextColor(0, 51, 102);
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("BUNDESREPUBLIK DEUTSCHLAND", pageWidth / 2, 45, { align: "center" });
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text("FEDERAL BUREAU OF IMMIGRATION & GLOBAL EMPLOYMENT", pageWidth / 2, 52, { align: "center" });
            
            doc.setDrawColor(0, 51, 102);
            doc.setLineWidth(0.5);
            doc.line(20, 58, pageWidth - 20, 58);

            // 3. Document Title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("OFFICIAL JOB PLACEMENT NOTIFICATION", pageWidth / 2, 70, { align: "center" });
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Doc Ref: DE-GEP-${app.application_number}-${new Date().getFullYear()}`, pageWidth / 2, 76, { align: "center" });

            // 4. Content Content
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(33, 33, 33);
            
            const startY = 95;
            const lineHeight = 10;
            const labelCol = 25;
            const valueCol = 85;

            // Details Table - manual drawing for precision
            const details = [
                ["DATE OF ISSUE", new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })],
                ["APPLICATION NUMBER", app.application_number],
                ["APPLICANT NAME", app.email],
                ["CONTACT NUMBER", app.phone],
                ["JOB CATEGORY", app.selected_job],
                ["ASSIGNED ROLE (SUB-JOB)", app.selected_sub_job || "N/A"],
                ["HIRING PARTNER", jobPartnerMapping[app.selected_job]?.[app.selected_sub_job]?.company || "Federal Employment Agency"],
                ["MONTHLY SALARY", jobPartnerMapping[app.selected_job]?.[app.selected_sub_job]?.salary || "As per Collective Agreement"],
                ["APPLICATION DATE", new Date(app.created_at).toLocaleDateString()]
            ];

            details.forEach((row, idx) => {
                doc.setFont("helvetica", "bold");
                doc.text(`${row[0]}:`, labelCol, startY + (idx * lineHeight));
                doc.setFont("helvetica", "normal");
                doc.text(`${row[1]}`, valueCol, startY + (idx * lineHeight));
            });

            // 5. Official Statement
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            const statement = "This document serves as an official confirmation of your employment selection within the Federal Republic of Germany's Global Employment initiative. Your application has undergone rigorous verification and meets all standard institutional requirements.";
            const splitStatement = doc.splitTextToSize(statement, pageWidth - 50);
            doc.text(splitStatement, 25, startY + (lineHeight * 10));

            // 6. Signature and Stamp
            const stampImg = new Image();
            stampImg.src = "/germany_stamp.png";
            
            const sigImg = new Image();
            sigImg.src = "/official_signature.png";

            // Wait for images to load (simplified for this context)
            await new Promise(r => setTimeout(r, 1000));

            try {
                doc.addImage(sigImg, 'PNG', 25, pageHeight - 80, 50, 25);
                doc.text("OFFICIAL SIGNATURE", 25, pageHeight - 50);
                
                doc.addImage(stampImg, 'PNG', pageWidth - 85, pageHeight - 90, 60, 60);
                doc.setFontSize(10);
                doc.text("OFFICIAL SEAL", pageWidth - 55, pageHeight - 30, { align: "center" });
            } catch (e) {
                console.warn("Failed to add images to PDF", e);
            }

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("Verify this document at: https://kenyagermany-jobs.vercel.app/checkstatus", pageWidth / 2, pageHeight - 15, { align: "center" });

            const pdfBase64 = doc.output('datauristring');

            // 2. Send via API
            let emailSuccess = false;
            let emailErrorMsg = "";
            try {
                const response = await fetch("/api/send-official-pdf", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pdfBase64, email: app.email, applicationNumber: app.application_number, phone: app.phone })
                });
                
                if (response.ok) {
                    emailSuccess = true;
                } else {
                    const status = response.status;
                    const errorData = await response.json().catch(() => ({ error: `Status: ${status}` }));
                    emailErrorMsg = errorData.details || errorData.error || `Email failed (${status})`;
                }
            } catch (err) {
                emailErrorMsg = err.message;
            }

            // 3. Send SMS informing them (Sent regardless of email failure)
            let smsSuccess = false;
            try {
                const smsMessage = `Your official Germany Job document (Ref: ${app.application_number}) has been sent to ${app.email}. Please check your inbox/spam. If any issues reach us through Whatsapp at +254737872584 or email at keinfoimmigration@gmail.com for support.`;
                const smsRes = await fetch("/api/send-sms", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        phone: app.phone, 
                        message: smsMessage, 
                        stage: "DocSent", 
                        applicationNumber: app.application_number 
                    })
                });
                if (smsRes.ok) {
                    smsSuccess = true;
                } else {
                    const smsErrData = await smsRes.json().catch(() => ({ error: `Status: ${smsRes.status}` }));
                    console.warn("SMS service error:", smsErrData);
                }
            } catch (err) {
                console.warn("SMS network failure:", err);
            }

            if (emailSuccess) {
                Swal.fire("Success!", "Official document generated, emailed, and SMS dispatched.", "success");
            } else {
                Swal.fire({
                    title: "Email Failed, SMS Sent",
                    text: `The SMS was sent, but the email failed: ${emailErrorMsg}. Please check your SMTP settings or retry email manually.`,
                    icon: "warning",
                    confirmButtonColor: "#f59e0b"
                });
            }
            fetchApplicants(); // Refresh UI

        } catch (error) {
            console.error("PDF Error:", error);
            Swal.fire("Operation Failed", error.message, "error");
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
                <div className="stat-card partner-card">
                    <h3>Top Hiring Partner (Germany)</h3>
                    <p className="stat-number">DHL Group</p>
                    <div className="partner-details">
                        <span className="salary-range">Range: €2,250 - €2,850 / mo</span>
                        <span className="partner-tag">Verified Partner</span>
                    </div>
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
                                                {app.selected_sub_job && (
                                                    <div className="partner-info-small">
                                                        <span className="partner-name">🏢 {jobPartnerMapping[app.selected_job]?.[app.selected_sub_job]?.company}</span>
                                                        <span className="partner-salary">💰 {jobPartnerMapping[app.selected_job]?.[app.selected_sub_job]?.salary}/mo</span>
                                                        {app.official_document_sent === 1 && (
                                                            <div className="doc-sent-badge">📜 Document Dispatched</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>{formatDate(app.created_at)}</td>
                                        <td>
                                            <span className={`status-badge ${app.status?.toLowerCase().replaceAll(" ", "-")}`}>
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

                                                {app.status === "Approved" && (
                                                    <div className="approved-specific-actions">
                                                        {!app.selected_job && (
                                                            <>
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
                                                            </>
                                                        )}

                                                        {app.selected_job && (
                                                            <button 
                                                                className="generate-doc-btn"
                                                                onClick={() => generateAndSendOfficialPDF(app)}
                                                                title="Generate Professional PDF Seal"
                                                                disabled={sendingSms[app.application_number]}
                                                            >
                                                                📜 Send Official Doc
                                                            </button>
                                                        )}
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
