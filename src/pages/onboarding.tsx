// onboarding.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from '../hooks/useSocket';
import { ChromePicker } from 'react-color';
import { Gutter } from '../app/_components/Gutter';
import { Button } from '../app/_components/Button';
import { MultiInput } from '../app/_components/MultiInput';

import '../app/_css/onboarding.scss';

const Onboarding = () => {
  const router = useRouter();
  const { socket, isConnected, sendMessage } = useSocket();
  const { userId, accessToken } = router.query;

  const [primaryColor, setPrimaryColor] = useState('#fff');
  const [secondaryColor, setSecondaryColor] = useState('#fff');
  const [keywords, setKeywords] = useState([]);

  const [currentStep, setCurrentStep] = useState(1);
  useEffect(() => {
    if (socket) {
      sendMessage('text', 'Message from the client');
    }

    if (userId && accessToken) {
      handleOnboarding(userId, accessToken);
    }
  }, [socket, userId, accessToken]);

  const handleOnboarding = async (userId, accessToken) => {
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, accessToken, primaryColor, secondaryColor, keywords }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Onboarding failed:', errorText);
      } else {
        console.log('Onboarding completed successfully');
      }
    } catch (error) {
      console.error('Onboarding failed:', error);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleOnboarding(userId, accessToken);
  };


  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <Gutter>
      <div className="onboarding-card">
        <div className="form-container">
          {currentStep === 1 && ( // Show color pickers on step 1
            <>
                <h2 className="onboarding-title">Pick Your Colors</h2>
                <form onSubmit={handleNextStep}> {/* Submitting this form goes to next step */}
                <div className="color-picker-container">
                    <div>
                        <label className="color-label">
                        <span>Primary Color:</span>
                        <div className="color-preview" style={{ backgroundColor: primaryColor }}></div> {/* Moved color preview */}
                        </label>
                        <ChromePicker color={primaryColor} onChange={updatedColor => setPrimaryColor(updatedColor.hex)} />
                    </div>
                    <div>
                        <label className="color-label">
                        <span>Secondary Color:</span>
                        <div className="color-preview" style={{ backgroundColor: secondaryColor }}></div> {/* Moved color preview */}
                        </label>
                        <ChromePicker color={secondaryColor} onChange={updatedColor => setSecondaryColor(updatedColor.hex)} />
                    </div>
                    </div>
                <Button type="submit" label="Next" appearance="primary" className="next-button" /> {/* Next button */}
                </form>
            </>
          )}
          {currentStep === 2 && ( 
            <>
                <h2 className="onboarding-title">Pick Your Keywords</h2>
                <form onSubmit={handleSubmit}> 
                <MultiInput keywords={keywords} onChange={setKeywords} />
                <div className="button-group">
                    <Button type="button" label="Previous" onClick={handlePreviousStep} appearance="secondary" className="previous-button" /> {/* Previous button */}
                    <Button type="submit" label="Generate Site" appearance="primary" className="generate-button" />
                </div>
                </form>
            </>
          )}
        </div>
      </div>
    </Gutter>
  );
};

export default Onboarding;