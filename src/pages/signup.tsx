'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Input } from '../app/_components/Input'; 
import { Button } from '../app/_components/Button';

import '../app/_css/signup.scss';

type FormData = {
    instagramHandle: string;
    email: string;
    // password: string
};

const SignupForm: React.FC = () =>  {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const router = useRouter();

    const onSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorObj = await response.json();
                const errorText = errorObj.error || 'An error occurred during signup.';
                console.error('Server responded with an error:', errorText);
                setError('An error occurred during signup: ' + errorText);
            } else {
                const data = await response.json();

                const { userId, accessToken, instagramHandle } = data;
                router.push(`/onboarding?userId=${userId}&instagramHandle=${instagramHandle}&accessToken=${accessToken}`);
            }
        } catch (error) {
            console.error('Signup failed:', error);
            setError('An error occurred during signup.');
        }
        setLoading(false);
    };

    return (
        <div className="signup-container">
        <h2 className="signup-title">Generate a Website Using Your Content</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
            {error && <b className="error-message">{error}</b>}
            <div>
                <Input name="email" label="Email" required register={register} error={errors.email} type="email" />
                </div>
            <div>
                <Input name="instagramHandle" label="Instagram Handle" required register={register} error={errors.instagramHandle} type="text" />
            </div>
            <Button type="submit" label={loading ? 'Generating...' : 'Generate Site'} disabled={loading} appearance="primary" className="button mt-40" />
        </form>
        </div>
    );
}

export default SignupForm;