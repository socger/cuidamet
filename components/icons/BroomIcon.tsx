
import React from 'react';

const BroomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 19.5h14M8 19.5V8.25a2.25 2.25 0 012.25-2.25h3.5A2.25 2.25 0 0116 8.25v11.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 19.5L5 16m3 3.5l3-3.5" />
  </svg>
);

export default BroomIcon;
