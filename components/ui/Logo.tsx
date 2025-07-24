
'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <img 
          src="https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/71a82f9784f9d607d9a92dce0ec4506a.jfif" 
          alt="ProFitness Logo"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
