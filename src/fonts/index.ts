import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

const ppNeueMontreal = localFont({
  src: [
    {
      path: './PPNeueMontreal-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './PPNeueMontreal-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './PPNeueMontreal-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  preload: true,
  display: 'swap',
});

export default ppNeueMontreal.className;
