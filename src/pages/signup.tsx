import { getCookie } from 'cookies-next';
import Link from 'next/link'
import { useRouter } from 'next/router'

import '../app/globals.css'

export default function SignupPage( {username} ) {
    const router = useRouter();

    // Function to handle Instagram authorization
    const handleInstagramAuth = () => {
        const clientId = '743103918004392';
        const redirectUri = 'https://localhost:3000/api/instagram/callback';
        const scope = 'user_profile';
        const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

        // Redirecting user to the Instagram Authorization Window
        window.location.href = authUrl;
    };


    const { msg } = router.query
    return (
        <div>
            <Link href="/">Home</Link><br/>
            {msg ?
                <h3 className="red">{msg}</h3>
            :
                <></>
            }
            <h2>Sign up</h2>
            <form action='/api/signup' method='POST'>
                <input minLength={3} name="username" id="username" type="text" placeholder='Username' required></input><br/>
                <input minLength={5} name="password" id="password" type="password" placeholder='Password' required></input><br/>
                <input minLength={5} name="passwordagain" id="passwordagain" type="password" placeholder='Password again' required></input><br/>
                <input name="client_name" id="client_name" type="text" placeholder='Client Name' required></input><br/>
                <input name="client_instagram_handle" id="client_instagram_handle" type="text" placeholder='Client Instagram Handle'></input><br/>
                <input name="client_business_name" id="client_business_name" type="text" placeholder='Client Business Name' required></input><br/>
                <input name="client_phone_number" id="client_phone_number" type="tel" placeholder='Client Phone Number' required></input><br/>
                <input name="client_email" id="client_email" type="email" placeholder='Client Email' required></input><br/>
                <input name="client_service_area" id="client_service_area" type="text" placeholder='Client Service Area' required></input><br/>
                <input name="client_business_address" id="client_business_address" type="text" placeholder='Client Business Address' required></input><br/>
                <input name="client_operating_hours" id="client_operating_hours" type="text" placeholder='Client Operating Hours' required></input><br/>
                <button onClick={handleInstagramAuth}>Authorize Instagram</button>
                <input type="submit" value="Signup"/>
            </form>
            </div>
        // </Layout>
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