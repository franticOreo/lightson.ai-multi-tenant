import React from 'react';
import logoSrc from '../../../public/logo.svg';
import './logo.scss';

export const Logo = () => React.createElement(
  'div',
  { className: 'logo' },
  React.createElement('img', { src: logoSrc, alt: 'lightson.ai Logo' })
);

