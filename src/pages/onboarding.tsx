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
  const [aboutText, setAboutText] = useState('');
  const [colorChoice, setColorChoice] = useState<'happy' | 'custom' | null>('happy');
  const [keywordsChoice, setKeywordsChoice] = useState<'happy' | 'custom' | null>('happy');
  const [aboutPageChoice, setAboutPageChoice] = useState<'happy' | 'custom' | null>('happy');
  const [servicesChoice, setServicesChoice] = useState<'happy' | 'custom' | null>('happy');

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
        const { data } = await response.json() as { data: any };
        console.log(data)
        setPrimaryColor(data.primaryColor || '#fff'); // Prepopulate primary color
        setSecondaryColor(data.secondaryColor || '#fff'); // Prepopulate secondary color
        setKeywords(data.keywords.map(keyword => keyword.keyword) || []);
        setAboutText(data.aboutPage || '')
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

  const handleAboutChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAboutText(event.target.value);
  };

  return (
    <Gutter>
      <div className="onboarding-card">
        <div className="form-container">
          {currentStep === 1 && (
            <>
              {colorChoice === 'happy' ? (
                <div className="color-prompt">
                  <p>We've looked at your profile and have picked these colors:</p>
                  <div className="color-preview-container">
                    <div className="color-preview" style={{ backgroundColor: primaryColor }}></div>
                    <div className="color-preview" style={{ backgroundColor: secondaryColor }}></div>
                  </div>
                  <p>What do you think?</p>
                  <div className="color-choice-buttons">
                    <Button
                      type="button"
                      label="Happy with them"
                      onClick={() => { handleNextStep(); }}
                      appearance="primary"
                    />
                    <Button
                      type="button"
                      label="I'll pick my own"
                      onClick={() => setColorChoice('custom')}
                      appearance="secondary"
                    />
                  </div>
                </div>
              )
              : (
                <form>
                    <h2 className="onboarding-title">Pick Your Pallete</h2>
                    <div className="color-picker-container">
                        <div>
                        <label className="color-label">
                            Primary Color:
                            <div className="color-preview" style={{ backgroundColor: primaryColor }}></div>
                        </label>
                        <ChromePicker color={primaryColor} onChange={updatedColor => setPrimaryColor(updatedColor.hex)} />
                        </div>
                        <div>
                        <label className="color-label">
                            Secondary Color:
                            <div className="color-preview" style={{ backgroundColor: secondaryColor }}></div>
                        </label>
                        <ChromePicker color={secondaryColor} onChange={updatedColor => setSecondaryColor(updatedColor.hex)} />
                        </div>
                    </div>
                    <Button type="button" label="Next" appearance="primary" className="next-button" onClick={handleNextStep}/>
                </form>
              )}
            </>
          )}
          {currentStep === 2 && (
            <>
            {keywordsChoice === 'happy' ? (
              <div className="color-prompt">
                <h2 className="onboarding-title">Your Keywords</h2>
                <p>We have selected out these keywords for your content</p>
                <div className='keywords-container'>
                  {keywords.map((keyword, index) => (
                    <div key={index} className="keyword-item">{keyword}</div>
                    ))}
                </div>
                <p>What do you think?</p>
                <div className="color-choice-buttons">
                  <Button
                    type="button"
                    label="Happy with them"
                    onClick={() => { handleNextStep(); }}
                    appearance="primary"
                  />
                  <Button
                    type="button"
                    label="I'll pick my own"
                    onClick={() => setKeywordsChoice('custom')}
                    appearance="secondary"
                  />
                </div>
              </div>
            )
            : (
            <form onSubmit={handleSubmit}>
              <h2 className="onboarding-title">Pick Your Keywords</h2>
              <MultiInput keywords={keywords} onChange={setKeywords} />
              <div className="button-group">
                <Button type="button" label="Previous" onClick={handlePreviousStep} appearance="secondary" className="previous-button" />
                <Button type="button" label="Next" appearance="primary" className="next-button" onClick={handleNextStep}/>
              </div>
            </form>
            )}
            </>
          )}
          {currentStep === 3 && ( 
            <>
            {aboutPageChoice === 'happy' ? (
              <div className="color-prompt">
                <h2 className="onboarding-title">About Your Business</h2>
                <div className="about-section"> 
                    <textarea
                    id="about"
                    className="about-textarea"
                    value={aboutText}
                    placeholder="Tell us about your business..."
                    disabled
                    />
                </div>
                <p>What do you think of the generated about?</p>
                <div className="color-choice-buttons">
                  <Button
                    type="button"
                    label="Happy with them"
                    onClick={() => { handleNextStep(); }}
                    appearance="primary"
                  />
                  <Button
                    type="button"
                    label="I'll pick my own"
                    onClick={() => setAboutPageChoice('custom')}
                    appearance="secondary"
                  />
                </div>
              </div>
            )
            : (
            <form onSubmit={handleSubmit}>
              <h2 className="onboarding-title">About Your Business</h2>
              <div className="about-section"> 
                <textarea
                  id="about"
                  className="about-textarea"
                  value={aboutText}
                  onChange={handleAboutChange}
                  placeholder="Tell us about your business..."
                />
              </div>
              <div className="button-group">
                <Button type="button" label="Previous" onClick={handlePreviousStep} appearance="secondary" className="previous-button" />
                <Button type="submit" label="Generate Site" appearance="primary" className="next-button" />
              </div>
            </form>
            )}
            </>
          )}
        </div>
      </div>
    </Gutter>
  );
};

export default Onboarding;