'use client';

interface MacroCardProps {
  label: string;
  consumed: number;
  target: number;
  color: 'red' | 'yellow' | 'green';
  unit?: string;
}

export default function MacroCard({ label, consumed, target, color, unit = 'g' }: MacroCardProps) {
  const percentage = Math.min((consumed / target) * 100, 100);
  
  const colorClasses = {
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      stroke: '#ef4444'
    },
    yellow: {
      bg: 'bg-yellow-100', 
      text: 'text-yellow-600',
      stroke: '#f59e0b'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600', 
      stroke: '#10b981'
    }
  };

  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={colorClasses[color].stroke}
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold ${colorClasses[color].text}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <p className="text-xs text-gray-500">{consumed}{unit} / {target}{unit}</p>
    </div>
  );
}