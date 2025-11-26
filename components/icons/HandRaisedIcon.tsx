import React from 'react';

const HandRaisedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575a1.575 1.575 0 013.15 0v3m-3.15 0V10.5c-.853 5-1.43 8.534-8.106 8.534V11.25c0-.621.504-1.125 1.125-1.125H7.5a1.125 1.125 0 011.125 1.125v5.625c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125V10.5m1.5 0v.75c0 2.132 1.868 3.75 3.75 3.75 2.132 0 3.75-1.868 3.75-3.75V7.575a1.575 1.575 0 00-3.15 0V10.5" />
  </svg>
);

export default HandRaisedIcon;
