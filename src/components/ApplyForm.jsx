import { useState } from 'react';
import './ApplyForm.css';

export default function ApplyForm({ jobId }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cv, setCv] = useState('');
  const [status, setStatus] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    setStatus('sending');
    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, name, email, cv }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then(() => setStatus('sent'))
      .catch(() => setStatus('error'));
  };

  if (status === 'sent') return <p>Application submitted! We will be in touch.</p>;

  return (
    <form className="apply-form" onSubmit={submit}>
      <h3>Apply for this job</h3>
      <div>
        <label>Name:</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>CV / Cover Letter (paste text):</label>
        <textarea
          required
          value={cv}
          onChange={(e) => setCv(e.target.value)}
        />
      </div>
      <button type="submit">Send application</button>
      {status === 'sending' && <p>Sending...</p>}
      {status === 'error' && <p className="error">Error submitting application.</p>}
    </form>
  );
}
