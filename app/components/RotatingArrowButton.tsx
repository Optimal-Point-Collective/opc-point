import React from 'react';
import Link from 'next/link';

interface RotatingArrowButtonProps {
  text: string;
  className?: string;
  href?: string;
}

const RotatingArrowButton: React.FC<RotatingArrowButtonProps> = ({ text, className, href }) => {
  const content = (
    <>
      {text}
      <span className={`ml-2 transform transition-transform duration-300 group-hover:rotate-90 ${!text && 'ml-0'}`}>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 9L9 1M9 1H1M9 1V9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </>
  );

  const buttonClassName = `text-sm font-normal text-white flex items-center group ${className}`;

  if (href) {
    return (
      <Link href={href} className={buttonClassName}>
        {content}
      </Link>
    );
  }

  return (
    <a href="#" className={buttonClassName}>
      {content}
    </a>
  );
};

export default RotatingArrowButton;
