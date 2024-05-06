'use client'

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
// import { Input, Button, Message } from '../components'; // Adjust import paths as needed
import { Input } from '../app/_components/Input'; 
import { Gutter } from '../app/_components/Gutter';
import { Button } from '../app/_components/Button';


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
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/waitlists`, {
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
            <h1 className='unbounded'>We will speak to you soon!</h1>
          </div>
        </div>
      </Gutter>
    );
  }

  return (
    <Gutter>
    <div className="card ">
      <div className="form-container">
        <h1 className='unbounded'>lightson.ai</h1><br />
        <h2 className='unbounded'>Use Your Instagram Content to Build a Business Website </h2>
        <h3 className='unbounded'>Join Our Waitlist</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input name="email" label="Email" required register={register} error={errors.email} type="email" />
          <Input name="instagramHandle" label="Instagram Handle" required register={register} error={errors.instagramHandle} type="text" />
          <Button
            type="submit"
            label={loading ? 'Joining Waitlist...' : 'Join'}
            disabled={loading}
            appearance="primary"
            className="button mt-40"
          />
        </form>
      </div>
    </div>
    </Gutter>
  );
};

export default WaitlistForm;

