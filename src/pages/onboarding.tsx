// onboarding.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from '../hooks/useSocket';
import { ChromePicker } from 'react-color';
import { Gutter } from '../app/_components/Gutter';
import { Button } from '../app/_components/Button';
import { InputItem, MultiInput } from '../app/_components/MultiInput';

import '../app/_css/onboarding.scss';
import { ZoomingCircleLoaderWithStyles } from '../app/_components/LoadingShimmer/PageLoader';

const Onboarding = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const { socket, isConnected, sendMessage } = useSocket();
  const { userId, accessToken, instagramHandle } = router.query;
  const [businessId, setBusinessId] = useState(null)
  const [siteUrl, setSiteUrl] = useState(null);

  const [primaryColor, setPrimaryColor] = useState('#fff');
  const [secondaryColor, setSecondaryColor] = useState('#fff');
  const [keywords, setKeywords] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [aboutPage, setAboutPage] = useState('');
  const [colorChoice, setColorChoice] = useState<'happy' | 'custom' | null>('happy');
  const [keywordsChoice, setKeywordsChoice] = useState<'happy' | 'custom' | null>('happy');
  const [aboutPageChoice, setAboutPageChoice] = useState<'happy' | 'custom' | null>('happy');
  const [servicesChoice, setServicesChoice] = useState<'happy' | 'custom' | null>('happy');

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    let intervalId: any;

    if (socket) {
      sendMessage('text', 'Message from the client');
    }

    const handleOnboarding = async (userId, accessToken) => {
      try {
          const params = new URLSearchParams({
              userId: userId,
              accessToken: accessToken,
              primaryColor: primaryColor,
              secondaryColor: secondaryColor,
              keywords: JSON.stringify(keywords),
          });
        const response = await fetch(`/api/onboarding?${params.toString()}`);
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Onboarding failed:', errorText);
        } else {
          const { data } = await response.json() as { data: any };
          updateStates(data)

          if (data.primaryColor && data.secondaryColor && data.keywords.length && data.serviceList.length) {
            setPageLoaded(true);
            clearInterval(intervalId);
            console.log('Onboarding completed successfully');
          }
        }
      } catch (error) {
        console.error('Onboarding failed:', error);
      }
    };

    if (userId && accessToken) {
      handleOnboarding(userId, accessToken);
      intervalId = setInterval(() => {
        handleOnboarding(userId, accessToken);
      }, 2000);
    }
  }, [socket, userId, accessToken]);


  const updateStates = (data: any)=>{
    setBusinessId(data.id)
    setPrimaryColor(data.primaryColor || '#fff'); // Prepopulate primary color
    setSecondaryColor(data.secondaryColor || '#fff'); // Prepopulate secondary color
    setKeywords(data.keywords.map(keyword => keyword.keyword) || []);
    setServiceList(data.serviceList.map(service => service.service) || []);
    setAboutPage(data.aboutPage || '')
  }


  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleAboutChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAboutPage(event.target.value);
  };

  const generateAboutPage = async() => {
    const updateData = {
        userId,
        accessToken,
        instagramHandle,
        businessId,
        primaryColor,
        secondaryColor,
        aboutPage,
        keywords: keywords.map(keyword => ({ keyword })),
        serviceList: serviceList.map(service => ({ service }))
    }

    console.log(updateData)
    try {
        setLoading(true);
        const response = await fetch('/api/onboarding', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });
        if (response.ok){
            const { message, data } = await response.json()
            const { domainUrl, ...update} = data
            setSiteUrl(domainUrl)
            updateStates(update)
            handleNextStep()
        }
    } catch (error) {
        console.log('Error updating about page:', error);
    } finally {
        setLoading(false);}
  }
  return (
    <Gutter>
      <div className="onboarding-card">
        <div className="form-container">
          {currentStep === 1 && (
            <>
              {(primaryColor === '#fff' && secondaryColor === '#fff') ?
              <ZoomingCircleLoaderWithStyles />
              : null
              }
              <h2 className="onboarding-title">We've picked you out some theme colours</h2>
              {colorChoice === 'happy' ? (
                <div className="color-prompt">
                  <div className="color-preview-container">
                    <div className='color-item'>
                        <div className="color-preview" style={{ backgroundColor: primaryColor }}></div>
                        <span>Primary Color</span>
                    </div>
                    <div className='color-item'>
                        <div className="color-preview" style={{ backgroundColor: secondaryColor }}></div>
                        <span>Secondary Color</span>
                    </div>
                  </div>
                  {(primaryColor !== '#fff' && secondaryColor !== '#fff') ?
                    <div className="color-choice-buttons">
                      <Button
                        type="button"
                        label="Happy with them"
                        onClick={() => { handleNextStep(); }}
                        appearance="positive"
                      />
                      <Button
                        type="button"
                        label="I'll pick my own"
                        onClick={() => setColorChoice('custom')}
                        appearance="secondary"
                      />
                    </div>
                  : null
                  }
                </div>
              )
              : (
                <form>
                    <div className="color-picker-container">
                        <div>
                        <label className="color-label">
                            Primary
                            <div className="color-preview" style={{ backgroundColor: primaryColor }}></div>
                        </label>
                        <ChromePicker color={primaryColor} onChange={updatedColor => setPrimaryColor(updatedColor.hex)} />
                        </div>
                        <div>
                        <label className="color-label">
                            Secondary
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
            {!keywords.length ?
              <ZoomingCircleLoaderWithStyles />
              : null
              }
            <h2 className="onboarding-title">Keywords</h2>
            {keywordsChoice === 'happy' ? (
              <div className="color-prompt">
                <p>We want people to be able to find your site. We have selected out some keywords. We will try to use these in your content.</p>
                <div className='keywords-container'>
                  {keywords.map((keyword, index) => (
                    <InputItem key={index} name={keyword} disabled={true}/>
                  ))}
                </div>
                <p>What do you think?</p>
                {keywords.length ?
                  <div className="color-choice-buttons">
                    <Button
                      type="button"
                      label="Happy with them"
                      onClick={() => { handleNextStep(); }}
                      appearance="positive"
                    />
                    <Button
                      type="button"
                      label="I'll pick my own"
                      onClick={() => setKeywordsChoice('custom')}
                      appearance="secondary"
                    />
                  </div>
                : null
                }
                
              </div>
            )
            : (
            <form>
              <MultiInput keywords={keywords} onChange={setKeywords} />
              <div className="button-group">
                <Button type="button" label="Previous" onClick={handlePreviousStep} appearance="secondary" />
                <Button type="button" label="Next" appearance="neutral" onClick={handleNextStep}/>
              </div>
            </form>
            )}
            </>
          )}
          {currentStep === 3 && ( 
            <>
            {!aboutPage?
              <ZoomingCircleLoaderWithStyles />
              : null
              }
            <h2 className="onboarding-title">About Your Business</h2>
            <p>We have generated an introduction for your site, have a look and see if you like it.</p>
            {aboutPageChoice === 'happy' ? (
              <div className="color-prompt">
                <div className="about-section"> 
                    <textarea
                    id="about"
                    className="about-textarea"
                    value={aboutPage}
                    placeholder="Tell us about your business..."
                    disabled
                    />
                </div>
                <p></p>
                {aboutPage?
                  <div className="color-choice-buttons">
                    <Button
                      type="button"
                      label="Happy with them"
                      onClick={() => { handleNextStep(); }}
                      appearance="positive"
                    />
                    <Button
                      type="button"
                      label="I'll write my own"
                      onClick={() => setAboutPageChoice('custom')}
                      appearance="secondary"
                    />
                  </div>
                : null
                }
              </div>
            )
            : (
            <form>
              <div className="about-section"> 
                <label htmlFor="about">Enter text below</label>
                <textarea
                  id="about"
                  className="about-textarea"
                  value={aboutPage}
                  onChange={handleAboutChange}
                  placeholder="Tell us about your business..."
                  autoFocus={true}
                />
              </div>
              <div className="button-group">
                <Button type="button" label="Previous" onClick={handlePreviousStep} appearance="secondary"/>
                <Button type="button" label="Next" appearance="neutral" onClick={handleNextStep}/>
              </div>
            </form>
            )}
            </>
          )}
          {currentStep === 4 && (
            <>
            {!serviceList.length ?
              <ZoomingCircleLoaderWithStyles />
              : null
              }
            <h2 className="onboarding-title">Services you provide</h2>
            {servicesChoice === 'happy' ? (
              <div className="color-prompt">
                <p>We've picked out services you provide, have a look and see if they are correct.</p>
                <div className='keywords-container'>
                  {serviceList.map((service, index) => (
                    <InputItem key={index} name={service} disabled={true}/>
                  ))}
                </div>
                <p>What do you think?</p>
                {serviceList.length ?
                  <div className="color-choice-buttons">
                    <Button
                      type="button"
                      label="Happy with them"
                      onClick={() => { handleNextStep(); }}
                      appearance="positive"
                    />
                    <Button
                      type="button"
                      label="I'll write my own"
                      onClick={() => setServicesChoice('custom')}
                      appearance="secondary"
                    />
                  </div>
                : null
                }
                
              </div>
            )
            : (
            <form>
              <MultiInput keywords={serviceList} onChange={setServiceList} />
              <div className="button-group">
                <Button type="button" label="Previous" onClick={handlePreviousStep} appearance="secondary"/>
                <Button type="button" label="Next" appearance="neutral" onClick={handleNextStep}/>
              </div>
            </form>
            )}
            </>
          )}
          {currentStep === 5 && (
            <div>
                <h2 className="onboarding-title">Preview Your Changes</h2>
                <div>
                    <strong>Your Color Pallete</strong>
                    <div className="total-preview-colors">
                        <div className='color-item'>
                            <div className="color-preview" style={{ backgroundColor: primaryColor }}></div>
                            <span>Primary Color</span>
                        </div>
                        <div className='color-item'>
                            <div className="color-preview" style={{ backgroundColor: secondaryColor }}></div>
                            <span>Secondary Color</span>
                        </div>
                    </div>
                </div>
                <hr />
                <div>
                    <strong>SEO Keywords</strong>
                    <div className='keywords-container'>
                        {keywords.map((keyword, index) => (
                            <InputItem key={index} name={keyword} disabled={true}/>
                        ))}
                    </div>
                </div>
                <hr />
                <div>
                    <strong>Services</strong>
                    <div className='keywords-container'>
                        {serviceList.map((service, index) => (
                            <InputItem key={index} name={service} disabled={true}/>
                        ))}
                    </div>
                </div>
                <hr />
                <div>
                    <strong>About Your Business</strong>
                    <div className="about-section"> 
                        <textarea
                        id="about"
                        className="about-textarea"
                        value={aboutPage}
                        placeholder="Tell us about your business..."
                        disabled
                        />
                    </div>
                </div>
                <div className="button-group">
                    <Button type="button" label="Previous" onClick={handlePreviousStep} appearance="secondary"/>
                    <Button type="button" label={loading ? "Updating..." : "Update"} disabled={loading} appearance="neutral" onClick={generateAboutPage} />
                </div>
            </div>
          )}
          {currentStep === 6 && (
            <>
            {!siteUrl ?
              <ZoomingCircleLoaderWithStyles />
              : null
              }
            <div className="color-prompt">
                <h2 className="onboarding-title">Success</h2>
                <p>Changes have been save successfully!</p>
                <p>Your site is ready on <a href={siteUrl} target='_blank'>{siteUrl}</a></p>
            </div>
            </>
          )}
        </div>
      </div>
    </Gutter>
  );
};

export default Onboarding;