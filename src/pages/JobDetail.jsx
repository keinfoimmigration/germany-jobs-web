import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import "./JobDetail.css";

export default function JobDetail() {
    const [currentStep, setCurrentStep] = useState(1);
    const [answers, setAnswers] = useState({});
    const [files, setFiles] = useState({});
    const [formData, setFormData] = useState({ email: "", phone: "" });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [applicationNumber, setApplicationNumber] = useState("");

    // Generate a unique application number
    const generateApplicationNumber = () => {
        const random = Math.floor(100000 + Math.random() * 900000);
        return `GK-${new Date().getFullYear()}-${random}`;
    };

    const handleAnswer = (question, value) => {
        setAnswers((prev) => ({ ...prev, [question]: value }));
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const proceedToDocuments = () => {
        if (!answers.q1 || !answers.q2 || !answers.q3) {
            setError("All assessment questions must be answered before proceeding.");
            return;
        }
        setError("");
        setCurrentStep(2);
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    // Upload file to Supabase Storage and return public URL
    const uploadFile = async (file, folder) => {
        if (!file) return null;

        const filePath = `${folder}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
            .from("applications")
            .upload(filePath, file);

        if (error) throw error;

        const { data } = supabase.storage
            .from("applications")
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    // Save application to Supabase DB
    const saveApplication = async () => {
        try {
            setSaving(true);

            // Generate unique application number
            const appNumber = generateApplicationNumber();
            setApplicationNumber(appNumber);

           
            // Insert into database
            const { data, error } = await supabase
                .from("applications")
                .insert([
                    {
                        application_number: appNumber,
                        email: formData.email,
                        phone: formData.phone,
                        experience: answers.q1,
                        relocate: answers.q2,
                        language: answers.q3,
                        status: "Pending Review"
                    },
                ]);

            if (error) {
                console.error("Error saving application:", error);
                setError("Failed to save application. Please try again.");
                setSaving(false);
                return false;
            }

            console.log("Application saved:", data);
            setSaving(false);
            return true;

        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred while saving.");
            setSaving(false);
            return false;
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

        const saved = await saveApplication();
        if (saved) {
            setCurrentStep(3); // Show success step
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
                <div className={currentStep === 3 ? "progress-step active" : "progress-step"}>
                    Application Submitted
                </div>
            </div>

            {/* STEP 1 — Assessment */}
            {currentStep === 1 && (
                <section className="official-card">
                    <h3>Eligibility Assessment</h3>
                    <div className="form-group">
                        <label>Do you possess a minimum of two (2) years professional experience? *</label>
                        <select onChange={(e) => handleAnswer("q1", e.target.value)}>
                            <option value="">Select an option</option>
                            <option>Yes</option>
                            <option>No</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Are you legally able and willing to relocate to Germany? *</label>
                        <select onChange={(e) => handleAnswer("q2", e.target.value)}>
                            <option value="">Select an option</option>
                            <option>Yes</option>
                            <option>No</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Do you possess English or German language proficiency? *</label>
                        <select onChange={(e) => handleAnswer("q3", e.target.value)}>
                            <option value="">Select an option</option>
                            <option>Yes</option>
                            <option>No</option>
                        </select>
                    </div>
                    <button className="primary-btn" onClick={proceedToDocuments}>
                        Continue
                    </button>
                </section>
            )}

            {/* STEP 2 — Contact & Documents */}
            {currentStep === 2 && (
                <section className="official-card">
                    <h3>Applicant Contact Information</h3>
                    <div className="form-group">
                        <label>Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="example@email.com"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Mobile Number *</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="+254 700 000 000"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </div>

                    <h3 style={{ marginTop: "2rem" }}>Required Documentation</h3>
                    <div className="form-group">
                        <label>National Identification Card (Front) *</label>
                        <input type="file" name="idFront" accept="image/*,.pdf" onChange={handleFileChange} />
                    </div>
                    <div className="form-group">
                        <label>National Identification Card (Back) *</label>
                        <input type="file" name="idBack" accept="image/*,.pdf" onChange={handleFileChange} />
                    </div>
                    <div className="form-group">
                        <label>Passport-Size Photograph *</label>
                        <input type="file" name="passportPhoto" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <button className="primary-btn" onClick={submitApplication} disabled={saving}>
                        {saving ? "Saving..." : "Submit Application"}
                    </button>
                </section>
            )}

            {/* STEP 3 — Success */}
            {currentStep === 3 && (
                <section className="success-card">
                    <h3>Application Successfully Submitted</h3>
                    <p>
                        Your application has been received and is pending review.
                    </p>
                    <p>
                        <strong>Application Number:</strong> {applicationNumber}
                    </p>
                    <p>
                        You can check your application status using this number in the portal.
                    </p>
                </section>
            )}

            {error && <div className="error-message">{error}</div>}
        </div>
    );
}