'use client'

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
// import { Input, Button, Message } from '../components'; // Adjust import paths as needed
import { Input } from '../app/_components/Input'; 
import { Gutter } from '../app/_components/Gutter';
import { Button } from '../app/_components/Button';

import Link from 'next/link'

import { Unbounded } from "next/font/google";
const unbounded = Unbounded({ subsets: ["latin"] }); // Adjust subsets as needed


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
            <h1 className={`${unbounded.className}`}>We will speak to you soon!</h1>
          </div>
        </div>
      </Gutter>
    );
  }

  return (
    <Gutter>
    <div className="card ">
      <div className="form-container">
        <h1 className={`${unbounded.className}`}>lightson.ai</h1><br />
        <h2 className={`${unbounded.className}`}>Use Your Instagram Content to Build a Business Website </h2>
        <h3 className={`${unbounded.className}`}>Join Our Waitlist</h3>
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





// export default function WaitlistForm() {
//     return (
//         <div className="min-h-screen flex items-center justify-center bg-secondary">
//           <div className="form-container card px-8 py-9 rounded-md shadow-lg w-full max-w-4xl">
//             <Link href="/"><h1 className={`text-xl font-bold mb-4 ${unbounded.className}`}>lightson.ai</h1></Link><br />
//             <h2 className={`text-xl font-bold mb-4 ${unbounded.className}`}>Use Your Instagram Content to Build a Business Website </h2>
//             <h3 className={`text-xl font-bold mb-4 ${unbounded.className}`}>Join Our Waitlist</h3>
//             <form action='/api/add-to-waitlist' method='POST' className="space-y-4">
//               <div className='flex flex-col'>
//                 <label htmlFor="email">Email:</label>
//                 <input name="email" id="email" type="email" placeholder='Email' className='input-neu' required></input><br />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="instagramHandle" className="font-medium">Instagram Handle (must be public page)</label>
//                 <input minLength={5} name="instagramHandle" id="instagramHandle" type="text" placeholder='Instagram Handle' className='input-neu' required></input>
//               </div>
//               <input type="submit" value="Join Waitlist" className='w-full p-7 mt-30 border-black border-2 bg-accent hover:bg-[#79F7FF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#00E1EF] rounded-full sm:mt-0 text-lg  leading-none' />
//             </form>
//           </div>
//         </div>
//     );
// }