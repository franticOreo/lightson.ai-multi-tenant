'use client'

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Input } from '../app/_components/Input'; 
import { Gutter } from '../app/_components/Gutter';
import { Button } from '../app/_components/Button';

import '../app/_css/signup.scss';


type FormData = {
  email: string;
  instagramHandle: string;
  surveyResponse1: string;
  surveyResponse2: string;
};

const WaitlistForm: React.FC = () =>  {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false); // State to track if the form has been submitted
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/waitlists`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(response.statusText);

      setSubmitted(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Gutter>
        <div className="card">
          <div className="form-container">
            <h3 className='unbounded'>Exiting times!<br /> <br />We will speak to you soon!</h3>
          </div>
        </div>
      </Gutter>
    );
  }

  return (
    <div className="signup-container">
      <h2 className='signup-title'>Join Our Waitlist</h2>
      <h3>Turn Your Instagram Posts Into a Stunning Portfolio Website</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
          {error && <b className="error-message">{error}</b>}
          <div>
              <Input name="email" label="Email" required register={register} error={errors.email} type="email" />
              </div>
          <div>
              <Input name="instagramHandle" label="Instagram Handle" required register={register} error={errors.instagramHandle} type="text" />
          </div>
          <Button type="submit" label={'Join'} disabled={loading} appearance="primary" className="button mt-40" />
      </form>
    </div>
  );
};

export default WaitlistForm;

