// Manually declare process.env for API_KEY usage
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

// Standard Vite asset declarations
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  const src: string;
  export default src;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module '*.webp';
