import React, { useState, useEffect } from 'react';

import './styles.css';

export const TipsAndFactsComponent = ({tipsAndFacts}: {tipsAndFacts: string[][]}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tipsAndFacts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tips-facts-container">
      <div className="header">
        <h2>{tipsAndFacts[currentIndex][0]}</h2>
      </div>
      <div className="content">
        <p>{tipsAndFacts[currentIndex][1]}</p>
      </div>
    </div>
  );
};

export default TipsAndFactsComponent;