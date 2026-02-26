import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./JobDetail.css";

export default function JobDetail() {
    const [currentStep, setCurrentStep] = useState(1);
    const [answers, setAnswers] = useState({});
    const [files, setFiles] = useState({});
    const [formData, setFormData] = useState({ email: "", phone: "", countryCode: "+254" });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    
    const countryFlags = {
        "+254": "🇰🇪",
        "+49": "🇩🇪",
        "+255": "🇹🇿",
        "+256": "🇺🇬",
        "+1": "🇺🇸",
        "+44": "🇬🇧"
    };

    const generateApplicationNumber = () => {
        const random = Math.floor(100000 + Math.random() * 900000);
        return `GK-${new Date().getFullYear()}-${random}`;
    };

    const handleAnswer = (question, value) => {
        setAnswers(prev => ({ ...prev, [question]: value }));
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const proceedToDocuments = () => {
        if (!answers.q1 || !answers.q2 || !answers.q3) {
            setError("All assessment questions must be answered.");
            return;
        }
        setError("");
        setCurrentStep(2);
    };

    const saveApplication = async () => {
        try {
            setSaving(true);

            const appNumber = generateApplicationNumber();

            const { error } = await supabase
                .from("applications")
                .insert([
                    {
                        application_number: appNumber,
                        email: formData.email,
                        phone: `${formData.countryCode}${formData.phone}`,
                        experience: answers.q1,
                        relocate: answers.q2,
                        language: answers.q3,
                        status: "Pending Review"
                    }
                ]);

            if (error) {
                console.error(error);
                setError("Failed to save application. Please try again.");
                setSaving(false);
                return null;
            }

            setSaving(false);
            return appNumber;

        } catch (err) {
            console.error(err);
            setError("Unexpected error occurred.");
            setSaving(false);
            return null;
        }
    };

    const submitApplication = async () => {
        if (!formData.email || !formData.phone) {
            setError("Email address and mobile number are required.");
            return;
        }

        if (!files.idFront || !files.idBack || !files.passportPhoto) {
            setError("All required documents must be uploaded.");
            return;
        }

        setError("");

        const appNumber = await saveApplication();

        if (appNumber) {
            Swal.fire({
                title: "Application Submitted Successfully",
                html: `
                    <div style="text-align:left; font-size:14px;">
                        <p style="margin-bottom:10px;">
                            Your application has been successfully received and is currently under review.
                        </p>

                        <div style="
                            margin:15px 0;
                            padding:14px;
                            background:#f4f8fb;
                            border-radius:8px;
                            text-align:center;
                        ">
                            <div style="font-size:13px; color:#666;">
                                Application Number
                            </div>
                            <div style="
                                font-size:18px;
                                font-weight:bold;
                                color:#003366;
                                margin-top:5px;
                                word-break:break-word;
                            ">
                                ${appNumber}
                            </div>
                        </div>

                        <p style="margin-top:10px;">
                            Please keep this number safe. You can use it to check your application status.
                        </p>
                    </div>
                `,
                icon: "success",
                showCancelButton: true,
                confirmButtonText: "Check Status",
                confirmButtonColor: "#003366",
                cancelButtonColor: "#6c757d",
                width: "95%",
                maxWidth: "420px",
                padding: "1.5rem",
                didOpen: () => {
                    const popup = document.querySelector(".swal2-popup");
                    popup.style.borderRadius = "12px";
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "/checkstatus";
                } else {
                    setCurrentStep(1);
                    setFormData({ email: "", phone: "" });
                    setAnswers({});
                    setFiles({});
                }
            });
        }
    };

    return (
        <div className="job-detail">
            <header className="job-header">
                <h2>Application Form</h2>
            </header>

            <div className="progress-bar">
                <div className={currentStep >= 1 ? "progress-step active" : "progress-step"}>
                    Eligibility Assessment
                </div>
                <div className={currentStep >= 2 ? "progress-step active" : "progress-step"}>
                    Applicant Information
                </div>
                <div className="progress-step">
                    Application Submitted
                </div>
            </div>

            {currentStep === 1 && (
                <section className="official-card">
                    <h3>Eligibility Assessment</h3>

                    <div className="form-group">
                        <label>Minimum 2 years experience Working? *</label>
                        <select onChange={(e) => handleAnswer("q1", e.target.value)}>
                            <option value="">Select</option>
                            <option>Yes</option>
                            <option>No</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Are you prepared to relocate to the Federal Republic of Germany upon successful issuance of a Work Visa? *</label>
                        <select onChange={(e) => handleAnswer("q2", e.target.value)}>
                            <option value="">Select</option>
                            <option>Yes</option>
                            <option>No</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>English or German proficiency? *</label>
                        <select onChange={(e) => handleAnswer("q3", e.target.value)}>
                            <option value="">Select</option>
                            <option>Yes</option>
                            <option>No</option>
                        </select>
                    </div>

                    <button className="primary-btn" onClick={proceedToDocuments}>
                        Continue
                    </button>
                </section>
            )}

            {currentStep === 2 && (
                <section className="official-card">
                    <h3>Applicant Contact Information</h3>

                    <div className="form-group">
                        <label>Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Mobile Number *</label>
                        <div className="phone-input-group">
                            <select
                                name="countryCode"
                                value={formData.countryCode}
                                onChange={handleInputChange}
                                className="country-code-select"
                            >
                                {Object.entries(countryFlags).map(([code, flag]) => (
                                    <option key={code} value={code}>
                                        {flag} {code}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="712345678"
                            />
                        </div>
                    </div>

                    <h3 style={{ marginTop: "2rem" }}>Required Documents</h3>

                    <div className="form-group">
                        <label>National ID (Front) *</label>
                        <input type="file" name="idFront" onChange={handleFileChange} />
                    </div>

                    <div className="form-group">
                        <label>National ID (Back) *</label>
                        <input type="file" name="idBack" onChange={handleFileChange} />
                    </div>

                    <div className="form-group">
                        <label>Passport Photo *</label>
                        <input type="file" name="passportPhoto" onChange={handleFileChange} />
                    </div>

                    <button
                        className="primary-btn"
                        onClick={submitApplication}
                        disabled={saving}
                    >
                        {saving ? "Submitting..." : "Submit Application"}
                    </button>
                </section>
            )}

            {error && <div className="modal-error">{error}</div>}
        </div>
    );
}