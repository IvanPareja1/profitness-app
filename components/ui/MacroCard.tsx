
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
  
  const colorMap = {
    red: '#ef4444',
    yellow: '#f59e0b',
    green: '#10b981'
  };

  const bgColorMap = {
    red: '#fef2f2',
    yellow: '#fffbeb',
    green: '#f0fdf4'
  };

  const textColorMap = {
    red: '#dc2626',
    yellow: '#d97706',
    green: '#059669'
  };

  return (
    <div style={{
      textAlign: 'center',
      backgroundColor: bgColorMap[color],
      borderRadius: '12px',
      padding: '16px'
    }}>
      <div style={{
        position: 'relative',
        width: '64px',
        height: '64px',
        margin: '0 auto 12px auto'
      }}>
        <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={colorMap[color]}
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            color: textColorMap[color]
          }}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <p style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0 0 4px 0'
      }}>{label}</p>
      <p style={{
        fontSize: '12px',
        color: '#6b7280',
        margin: 0
      }}>{consumed}{unit} / {target}{unit}</p>
    </div>
  );
}
