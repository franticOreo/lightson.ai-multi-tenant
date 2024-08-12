import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { Input } from '../app/_components/Input'; 
import { Gutter } from '../app/_components/Gutter';
import { Button } from '../app/_components/Button';
import { LoadingShimmer } from '../app/_components/LoadingShimmer';
import axios from 'axios';
import Link from 'next/link';

async function clientFetchBusinessData(accessToken: string, userId: string) {
  
  try {
      const response = await axios({
          method: 'GET',
          url: '/api/business', 
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`, // Ensure accessToken is passed correctly
          },
      });

      

      // Filter the response data by userId
      const filteredData = response.data.docs.filter((doc: any) => doc.userId.id === userId);

      console.log('filteredData', filteredData)

      return filteredData;
  } catch (error) {
      console.error('Failed to fetch business data:', error.response ? error.response.data : error.message);
      throw error;
  }
}

export function Onboarding() {
    const [isLoading, setIsLoading] = useState(true); // State to handle loading
    const [deploymentURL, setDeploymentURL] = useState<string>('');
    const router = useRouter();
    // const { userId, accessToken } = router.query;
    const userId = Array.isArray(router.query.userId) ? router.query.userId[0] : router.query.userId;
    const accessToken = Array.isArray(router.query.accessToken) ? router.query.accessToken[0] : router.query.accessToken;

    useEffect(() => {
      if (userId) {
          console.log(`User ID from query: ${userId}`);
          // Perform any data fetching or other actions with the userId here
          setTimeout(() => {
              setIsLoading(false);
          }, 2000); // Simulate loading time

          const fetchBusinessData = async () => {
            let data = null;
            let retries = 0;
            const maxRetries = 5; // Set a maximum number of retries to avoid infinite loops
        
            while (retries < maxRetries) {
                try {
                    data = await clientFetchBusinessData(accessToken, userId);
                    if (data.some((item: any) => item.projectDomainURL)) {
                        console.log('projectDomainURL found')
                        const projectDomainURL = "https://" + data[0].projectDomainURL
                        setDeploymentURL(projectDomainURL);
                        break;
                    } else {
                        retries++;
                        console.log(`Retrying... (${retries}/${maxRetries})`);
                        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 2 seconds before retrying
                    }
                } catch (err) {
                    console.error(err.message);
                    retries++;
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 2 seconds before retrying
                }
            }
        
            if (retries === maxRetries) {
                console.error('Max retries reached. Failed to fetch business data with projectDomainURL.');
            }
        };

          fetchBusinessData();
      }
  }, [userId, accessToken]);

    return (
        <Gutter>
            <div className="card">
                <div className="form-container">
                    {isLoading ? (
                        <LoadingShimmer number={5} /> // Display shimmer effect
                    ) : (
                        <>
                            <h1 className='unbounded'>lightson.ai</h1><br />
                            <h2 className='unbounded'>We are building Your site!</h2>
                            <div>
                                <a href={deploymentURL} target="_blank" rel="noopener noreferrer">
                                  {deploymentURL ? 'View your website' : 'Waiting for your website deployment...'}
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Gutter>
    );
}

export default Onboarding;