import React from 'react';
import logoSrc from '../assets/logo.svg'; // Adjust the path as necessary
import './logo.scss';

export const Logo = () => React.createElement(
  'div',
  { className: 'logo' },
  React.createElement('img', { src: logoSrc, alt: 'lightson.ai Logo' })
);

