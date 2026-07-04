/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

// Color definitions matching CSS Tokens
export const COLORS = {
  primary: '#F04B23', // Primary Orange
  secondary: '#FF5B2A', // Secondary Orange
  black: '#0F0F10', // Pitch Black
  darkGray: '#1A1A1A', // Dark Surface
  lightGray: '#D7D7D7', // Light Borders
  white: '#FFFFFF', // Clean White
  paper: '#F5F3EF', // Tactile Paper Texture
  accentBlue: '#4AA8D8', // Accent Comic Blue
  mutedRed: '#B5292A', // Muted Red
};

// Jagged SVG path to simulate custom torn paper
export function TornPaperDivider({ 
  flip = false, 
  color = COLORS.paper,
  height = 16 
}: { 
  flip?: boolean; 
  color?: string;
  height?: number;
}) {
  return (
    <div 
      className="w-full overflow-hidden select-none" 
      style={{ 
        height: `${height}px`,
        transform: flip ? 'scaleY(-1)' : 'none',
        lineHeight: 0,
        backgroundColor: 'transparent'
      }}
    >
      <svg 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none" 
        className="w-full h-full"
        style={{ fill: color }}
      >
        <path d="M0,0 L1200,0 L1200,40 L1180,35 L1150,55 L1110,30 L1080,48 L1050,22 L1010,50 L980,33 L940,55 L900,25 L860,42 L820,20 L780,48 L740,18 L710,38 L680,22 L640,48 L600,24 L560,44 L520,18 L480,45 L450,28 L410,50 L380,30 L340,52 L300,20 L260,45 L220,18 L190,38 L160,20 L120,48 L80,25 L40,44 L0,20 Z" />
      </svg>
    </div>
  );
}

export function SharpButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  id,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'black' | 'outline' | 'accent' | 'danger';
  className?: string;
  disabled?: boolean;
  id?: string;
}) {
  const baseStyle = "font-sans uppercase tracking-wider text-xs font-bold py-3 px-6 cursor-pointer select-none border-2 transition-all duration-200 ease-in-out active:translate-x-1 active:translate-y-1 rounded-none flex items-center justify-center gap-2";
  
  let variantStyle = "";
  switch(variant) {
    case 'primary':
      variantStyle = `bg-[#F04B23] border-[#0F0F10] text-white hover:bg-black hover:text-[#F04B23] shadow-[4px_4px_0px_0px_rgba(15,15,16,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,15,16,1)]`;
      break;
    case 'secondary':
      variantStyle = `bg-[#FF5B2A] border-[#0F0F10] text-white hover:bg-black shadow-[4px_4px_0px_0px_rgba(15,15,16,1)]`;
      break;
    case 'black':
      variantStyle = `bg-[#0F0F10] border-[#0F0F10] text-white hover:bg-[#F04B23] hover:text-black shadow-[4px_4px_0px_0px_rgba(240,75,35,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,15,16,1)]`;
      break;
    case 'outline':
      variantStyle = `bg-transparent border-[#0F0F10] text-[#0F0F10] hover:bg-[#0F0F10] hover:text-white shadow-[4px_4px_0px_0px_rgba(240,75,35,0.4)]`;
      break;
    case 'accent':
      variantStyle = `bg-[#4AA8D8] border-[#0F0F10] text-[#0F0F10] hover:bg-black hover:text-[#4AA8D8] shadow-[4px_4px_0px_0px_rgba(15,15,16,1)]`;
      break;
    case 'danger':
      variantStyle = `bg-[#B5292A] border-[#0F0F10] text-white hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(15,15,16,1)]`;
      break;
  }

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyle} ${disabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none active:translate-none' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function PaperCard({
  children,
  className = '',
  hoverEffect = true,
  rotated = false,
  bgColor = 'bg-[#F5F3EF]',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  rotated?: boolean;
  bgColor?: string;
  id?: string;
}) {
  const rotationClass = rotated ? 'transform -rotate-1 md:-rotate-2' : '';
  const hoverClass = hoverEffect ? 'hover:-translate-y-1 hover:translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(15,15,16,1)] transition-all duration-200' : '';
  
  return (
    <div
      id={id}
      className={`${bgColor} border-4 border-[#0F0F10] p-6 rounded-none shadow-[6px_6px_0px_0px_rgba(15,15,16,1)] ${rotationClass} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}

export function BrutalistBadge({
  children,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'yellow' | 'green' | 'black';
  className?: string;
}) {
  let colorClass = "";
  switch(variant) {
    case 'primary':
      colorClass = "bg-[#F04B23] text-white";
      break;
    case 'accent':
      colorClass = "bg-[#4AA8D8] text-black";
      break;
    case 'yellow':
      colorClass = "bg-[#F59E0B] text-black";
      break;
    case 'green':
      colorClass = "bg-[#10B981] text-white";
      break;
    case 'black':
      colorClass = "bg-[#0F0F10] text-white";
      break;
  }

  return (
    <span className={`inline-block font-sans uppercase tracking-wider text-[10px] font-black px-2.5 py-1 border-2 border-black rounded-none ${colorClass} ${className}`}>
      {children}
    </span>
  );
}

export function BrutalistHeading({
  children,
  level = 2,
  className = '',
}: {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const base = "font-sans uppercase font-black tracking-tighter text-black leading-none select-none";
  
  switch (level) {
    case 1:
      return <h1 className={`${base} text-6xl md:text-8xl ${className}`}>{children}</h1>;
    case 2:
      return <h2 className={`${base} text-4xl md:text-6xl ${className}`}>{children}</h2>;
    case 3:
      return <h3 className={`${base} text-2xl md:text-3xl ${className}`}>{children}</h3>;
    default:
      return <h4 className={`${base} text-lg md:text-xl ${className}`}>{children}</h4>;
  }
}

export function BrutalistInput({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  min,
  className = '',
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  min?: string | number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="font-sans uppercase font-black text-xs text-black tracking-wider">
        {label} {required && <span className="text-[#F04B23]">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        className="bg-white border-2 border-black p-3 rounded-none font-sans text-sm focus:outline-none focus:bg-[#F5F3EF] focus:ring-2 focus:ring-[#F04B23] text-black"
      />
    </div>
  );
}
