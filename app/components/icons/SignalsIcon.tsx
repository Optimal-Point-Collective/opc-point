import React from 'react';

const SignalsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.136 11.886a9 9 0 0113.728 0M12 18.75l.372.372a.75.75 0 001.06 0l.372-.372M12 18.75v2.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.747 10.73a.75.75 0 011.06 0L8.25 13.177M19.253 10.73a.75.75 0 00-1.06 0L15.75 13.177" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V7.5a.75.75 0 01.75-.75z" />
    </svg>
);

export default SignalsIcon;
