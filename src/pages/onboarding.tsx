import React, { useState, useEffect } from 'react';

import { Input } from '../app/_components/Input'; 
import { Gutter } from '../app/_components/Gutter';
import { Button } from '../app/_components/Button';
import { LoadingShimmer } from '../app/_components/LoadingShimmer';


export function Onboarding() {
    const [isLoading, setIsLoading] = useState(true); // State to handle loading

    // Example function to simulate data fetching
    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 2000); // Simulate loading time
    }, []);

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
                            <form>
                                {/* <Input name="email" label="Email" required register={register} error={errors.email} type="email" /> */}
                            </form>
                        </>
                    )}
                </div>
            </div>
        </Gutter>
    );
}

export default Onboarding;