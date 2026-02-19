import { useState } from "react";
import "./JobDetail.css";

export default function JobDetail() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [formData, setFormData] = useState({ email: "", phone: "" });
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [mpesaCode, setMpesaCode] = useState("");
  const [verifying, setVerifying] = useState(false);

    const tillNumber = "4139224"; // Replace with your actual till number

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

  // Show the payment modal
  const submitApplication = () => {
    if (!formData.email || !formData.phone) {
      setError("Email address and mobile number are required.");
      return;
    }

    if (!files.idFront || !files.idBack || !files.passportPhoto) {
      setError("All required documents must be uploaded.");
      return;
    }

    setError("");
    setShowPaymentModal(true);
  };

  // Verify the payment
  const verifyPayment = async () => {
    if (!mpesaCode) {
      setError("Please enter your MPESA transaction code.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mpesaCode,
          phone: formData.phone,
          amount: 10, // Expected payment amount
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCurrentStep(3); // Success
        setShowPaymentModal(false);
      } else {
        setError(data.message || "Payment verification failed. Please check your MPESA code.");
      }
    } catch (err) {
      setError("Error verifying payment. Please try again.");
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="job-detail">
      <header className="job-header">
        <h2>Job Application</h2>
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

          <button className="primary-btn" onClick={submitApplication}>
            Submit Application & Pay
          </button>
        </section>
      )}

      {/* STEP 3 — Success */}
      {currentStep === 3 && (
        <section className="success-card">
          <h3>Application Successfully Submitted</h3>
          <p>
            Your application has been received and is pending review. You will be contacted via the provided email or mobile number if shortlisted.
          </p>
        </section>
      )}

          {/* Payment Modal */}
          {showPaymentModal && (
              <div className="payment-modal">
                  <div className="modal-content">
                      <h3>Make Payment</h3>
                      <p>
                          Please pay administrative fee of <strong>1,000 KSH</strong> to till number: <strong>{tillNumber}</strong>
                          to Proceed with your application. After making the payment, enter your MPESA transaction code below to verify your payment.
                      </p>
                      <input
                          type="text"
                          placeholder="Enter MPESA Transaction Code"
                          value={mpesaCode}
                          onChange={(e) => setMpesaCode(e.target.value)}
                      />
                      {/* Error inside the modal */}
                      {error && <div className="modal-error">{error}</div>}

                      <div className="modal-buttons">
                          <button className="primary-btn" onClick={verifyPayment} disabled={verifying}>
                              {verifying ? "Verifying..." : "Verify Payment"}
                          </button>
                          <button className="secondary-btn" onClick={() => setShowPaymentModal(false)}>
                              Cancel
                          </button>
                      </div>
                  </div>
              </div>
          )}


      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
