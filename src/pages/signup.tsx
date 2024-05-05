import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import Link from 'next/link'
import { useRouter } from 'next/router'

import { Unbounded } from "next/font/google";
const unbounded = Unbounded({ subsets: ["latin"] }); // Adjust subsets as needed

import { Input } from '../app/_components/Input'; 
import { Gutter } from '../app/_components/Gutter';
import { Button } from '../app/_components/Button';


type FormData = {
    email: string;
    password: string;
    fullName: string;
    businessName: string;
    businessPhone: string;
    businessAddress: string;
    serviceArea: string;
    businessHours: string;
    operatingHours: string;
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

    console.log(process.env.NEXT_PUBLIC_REDIRECT_URI);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            // // signup user
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server responded with an error:', errorText);
                setError('An error occurred during signup: ' + errorText);
            } else {
                const result = await response.json();
                console.log(result)
                // Redirect the user to Instagram for authentication
                console.log('Signup successful, awaiting redirection...');
                window.location.href = result.authUrl;
                
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
                    <h1 className={`${unbounded.className}`}>lightson.ai</h1><br />
                    <h2 className={`text-xl font-bold mb-4 ${unbounded.className}`}>Generate a Website Using Your Content </h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input name="email" label="Email" required register={register} error={errors.email} type="email" />
                        <Input name="password" label="Password" required register={register} error={errors.password} type="password" />
                        <Input name="fullName" label="Full Name" required register={register} error={errors.fullName} type="text" />
                        <Input name="businessName" label="Business Name" required register={register} error={errors.businessName} type="text" />
                        <Input name="businessPhone" label="Business Phone" register={register} error={errors.businessPhone} type="number" />
                        <Input name="businessAddress" label="Business Address" register={register} error={errors.businessAddress} type="text" />
                        <Input name="serviceArea" label="Service Area" register={register} error={errors.serviceArea} type="text" />
                        <Input name="businessHours" label="Business Hours" register={register} error={errors.businessHours} type="text" />
                        <Input name="operatingHours" label="Operating Hours" register={register} error={errors.operatingHours} type="text" />
                        <Button
                            type="submit"
                            label={loading ? 'Generating...' : 'Generate Site'}
                            disabled={loading}
                            appearance="primary"
                            className="button mt-40"
                        />
                    </form>
                </div>
            </div>
        </Gutter>
    );
}

export default SignupForm;