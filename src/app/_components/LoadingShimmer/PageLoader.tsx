import React from 'react';

const ZoomingCircleLoader = () => {
  return (
    <div className="loader-container">
      <div className="zooming-circle"></div>
    </div>
  );
};

const styles = `
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.zooming-circle {
  width: 64px;
  height: 64px;
  background-color: #3b82f6;
  border-radius: 50%;
  animation: zoom 2s ease-in-out infinite;
}

@keyframes zoom {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
}
`;

export const ZoomingCircleLoaderWithStyles = () => (
  <>
    <style>{styles}</style>
    <ZoomingCircleLoader />
  </>
);