import { useState } from 'react';

export default function Signup() {
  const [subdomain, setSubdomain] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Call the API route to handle the signup and DNS update
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subdomain, email }),
    });

    const data = await response.json();
    setLoading(false);

    if (data.success) {
      alert('Signup successful! Your subdomain is being set up.');
    } else {
      alert('Signup failed: ' + data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email:</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="subdomain">Subdomain:</label>
      <input
        id="subdomain"
        type="text"
        value={subdomain}
        onChange={(e) => setSubdomain(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Sign Up'}
      </button>
    </form>
  );
}