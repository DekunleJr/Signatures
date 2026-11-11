import React, { useState } from 'react';
import { customAxios } from '../../utils/customAxios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader/Loader';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { toast } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') setName(value);
    else if (name === 'email') setEmail(value);
    else if (name === 'message') setMessage(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const contactMessage = { name, email, message };
      await customAxios.post('/contact/', contactMessage);
      setSuccess('Your message has been sent successfully!');
      toast.success('Your message has been sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Contact form submission error:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to send message. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='page contact'>
      <h1>Contact Us</h1>
      <p>We’d love to bring your dream space to life.</p>
      {loading && <Loader />}
      <div aria-live='polite'>
        {error && <p className='error-message' role='alert'>{error}</p>}
        {success && <p className='success-message'>{success}</p>}
      </div>
      <form className='contact-form' onSubmit={handleSubmit}>
        <label htmlFor='contact-name'>Your name</label>
        <input
          id='contact-name'
          type='text'
          name='name'
          autoComplete='name'
          placeholder='e.g. Ada Obi'
          value={name}
          onChange={handleChange}
          required
        />
        <label htmlFor='contact-email'>Your email</label>
        <input
          id='contact-email'
          type='email'
          name='email'
          autoComplete='email'
          placeholder='you@example.com'
          value={email}
          onChange={handleChange}
          required
        />
        <label htmlFor='contact-message'>How can we help?</label>
        <textarea
          id='contact-message'
          name='message'
          placeholder='Tell us about your space, timeline and budget'
          value={message}
          onChange={handleChange}
          required
        ></textarea>
        <button type='submit' className='btn' disabled={loading}>
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </section>
  );
}

export default Contact;
