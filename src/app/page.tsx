import { getCookie } from 'cookies-next';
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Unbounded } from "next/font/google";
const unbounded = Unbounded({ subsets: ["latin"] }); // Adjust subsets as needed

import '../app/globals.css'

//
// NEEDS SERVER SIDE CHECK FOR USER!!!
//
export default function WaitlistForm() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary">
          <div className="form-container card px-8 py-9 rounded-md shadow-lg w-full max-w-4xl">
            <Link href="/"><h1 className={`text-xl font-bold mb-4 ${unbounded.className}`}>lightson.ai</h1></Link><br />
            <h2 className={`text-xl font-bold mb-4 ${unbounded.className}`}>Use Your Instagram Content to Build a Business Website </h2>
            <h3 className={`text-xl font-bold mb-4 ${unbounded.className}`}>Join Our Waitlist</h3>
            <form action='/api/add-to-waitlist' method='POST' className="space-y-4">
              <div className='flex flex-col'>
                <label htmlFor="email">Email:</label>
                <input name="email" id="email" type="email" placeholder='Email' className='input-neu' required></input><br />
              </div>
              <div className="flex flex-col">
                <label htmlFor="instagramHandle" className="font-medium">Instagram Handle (must be public page)</label>
                <input minLength={5} name="instagramHandle" id="instagramHandle" type="text" placeholder='Instagram Handle' className='input-neu' required></input>
              </div>
              <input type="submit" value="Join Waitlist" className='w-full p-7 mt-30 border-black border-2 bg-accent hover:bg-[#79F7FF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#00E1EF] rounded-full sm:mt-0 text-lg  leading-none' />
            </form>
          </div>
        </div>
    );
}