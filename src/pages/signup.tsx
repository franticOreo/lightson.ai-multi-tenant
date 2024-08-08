import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import Link from 'next/link'
import { useRouter } from 'next/router'



import { Input } from '../app/_components/Input'; 
import { Gutter } from '../app/_components/Gutter';
import { Button } from '../app/_components/Button';


type FormData = {
    instagramHandle: string;
    email: string;
};
//
// NEEDS SERVER SIDE CHECK FOR USER!!!
//
const SignupForm: React.FC = () =>  {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false); // State to track if the form has been submitted
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
                const errorText = await response.text();
                console.error('Server responded with an error:', errorText);
                setError('An error occurred during signup: ' + errorText);
            } else {
                // Handle redirection
                if (response.redirected) {
                    console.log('Redirecting to:', response.url);
                    window.location.href = response.url;
                } else {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        console.log('Signup successful:', data);
                    } else {
                        const text = await response.text();
                        console.log('Received non-JSON response:', text);
                    }
                }
            }
        } catch (error) {
            console.error('Signup failed:', error);
            setError('An error occurred during signup.');
        }
        setLoading(false);
    };


    return (
        <Gutter>
            <div className="card ">
                <div className="form-container">
                    <h1 className='unbounded'>lightson.ai</h1><br />
                    <h2 className='unbounded'>Generate a Website Using Your Content </h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input name="instagramHandle" label="Instagram Handle" required register={register} error={errors.instagramHandle} type="text" />
                        <Input name="email" label="Email" required register={register} error={errors.email} type="email" />
                        <Button type="submit" label={loading ? 'Generating...' : 'Generate Site'} disabled={loading} appearance="primary" className="button mt-40" />
                    </form>
                </div>
            </div>
        </Gutter>
    );
}

export default SignupForm;