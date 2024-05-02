import { getCookie } from 'cookies-next';
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Unbounded } from "next/font/google";
const unbounded = Unbounded({ subsets: ["latin"] }); // Adjust subsets as needed



//
// NEEDS SERVER SIDE CHECK FOR USER!!!
//
export default function SignupPage( {username} ) {
    const router = useRouter();
    console.log(process.env.NEXT_PUBLIC_REDIRECT_URI);
    // Function to handle Instagram authorization
    const handleInstagramAuth = () => {
        const clientId = '743103918004392';
        const scope = 'user_profile,user_media';
        const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&scope=${scope}&response_type=code`;

        // Redirecting user to the Instagram Authorization Window
        console.log(authUrl)
        window.location.href = authUrl;
    };


    const { msg } = router.query
    return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="form-container card px-8 py-9 rounded-md shadow-lg w-full max-w-4xl">
            <Link href="/"><h1 className={`text-xl font-bold mb-4 ${unbounded.className}`}>lightson.ai</h1></Link><br/>
            {msg ?
                <h3 className="text-red-500">{msg}</h3>
            :
                <></>
            }
    <h2 className={`text-xl font-bold mb-4 ${unbounded.className}`}>Use Your Instagram Content to Build a Business Website </h2>
    <form action='/api/signup' method='POST' className="space-y-4">
    <div className='flex flex-col'>
    <label htmlFor="client_email">Email:</label>
    <input name="client_email" id="client_email" type="email" placeholder='Client Email' className='input-neu' required></input><br/>
    </div>
    <div className="flex flex-col">
        <label htmlFor="client_password" className="font-medium">Password:</label>
        <input minLength={5} name="client_password" id="client_password" type="password" placeholder='Password' className='input-neu' required></input>
    </div>
    <div className="flex flex-col">
    <label htmlFor="client_name">Name:</label>
    <input name="client_name" id="client_name" type="text" placeholder='Client Name' className='input-neu' required></input><br/>
    </div>
    {/* <div className='flex flex-col'>
    <label htmlFor="client_instagram_handle"> Instagram Handle:</label>
    <input name="client_instagram_handle" id="client_instagram_handle" type="text" placeholder='Client Instagram Handle' className='input-neu'></input><br/>
    </div> */}
    <div className='flex flex-col'>
    <label htmlFor="client_business_name"> Business Name:</label>
    <input name="client_business_name" id="client_business_name" type="text" placeholder='Client Business Name' className='input-neu' required></input><br/>
    </div>
    <div className='flex flex-col'>
    <label htmlFor="client_phone_number">Business Number:</label>
    <input name="client_phone_number" id="client_phone_number" type="tel" placeholder='Client Phone Number' className='input-neu' required></input><br/>
    </div>
    <div className='flex flex-col'>
    <label htmlFor="client_service_area">Service Area:</label>
    <input name="client_service_area" id="client_service_area" type="text" placeholder='Client Service Area' className='input-neu' required></input><br/>
    </div>
    <div className='flex flex-col'>
    <label htmlFor="client_business_address">Business Address:</label>
    <input name="client_business_address" id="client_business_address" type="text" placeholder='Client Business Address' className='input-neu' required></input><br/>
    </div>
    <div className='flex flex-col'>
    <label htmlFor="client_operating_hours">Operating Hours:</label>
    <input name="client_operating_hours" id="client_operating_hours" type="text" placeholder='Client Operating Hours' className='input-neu' required></input><br/>
    </div>
    <input type="submit" value="Generate Website" className='w-full p-7 mt-30 border-black border-2 bg-accent hover:bg-[#79F7FF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#00E1EF] rounded-full sm:mt-0 text-lg  leading-none'/>
</form>
            </div>
        </div>
    );
}

export async function getServerSideProps(context) {
    const req = context.req
    const res = context.res
    var username = getCookie('username', { req, res });
    if (username != undefined){
        return {
            redirect: {
                permanent: false,
                destination: "/"
            }
        }
    }
    return { props: {username:false} };
};