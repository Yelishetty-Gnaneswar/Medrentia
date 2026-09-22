import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'md', className = '', to = '/' }) => {
  const sizeClasses = {
    xs: 'h-7 w-7',
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-14 w-14',
    xl: 'h-16 w-16',
  };

  const content = (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt="MedRentia Logo"
        className={`${sizeClasses[size] || sizeClasses.md} rounded-xl object-contain shadow-sm shrink-0`}
      />
      <div>
        <div className="flex items-center leading-none">
          <span className="text-xl font-black tracking-tight text-slate-900">MED</span>
          <span className="text-xl font-black tracking-tight text-medgreen-600">RENTIA</span>
        </div>
        <span className="block text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">
          Medical Equipment
        </span>
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center group transition-transform hover:scale-[1.02]">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
