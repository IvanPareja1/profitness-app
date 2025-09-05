
interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ size = 'md' }: LogoProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { width: '32px', height: '32px', fontSize: '20px' };
      case 'md':
        return { width: '48px', height: '48px', fontSize: '28px' };
      case 'lg':
        return { width: '60px', height: '60px', fontSize: '32px' };
      case 'xl':
        return { width: '80px', height: '80px', fontSize: '40px' };
      default:
        return { width: '48px', height: '48px', fontSize: '28px' };
    }
  };

  const sizeStyle = getSizeClasses();

  return (
    <div
      style={{
        width: sizeStyle.width,
        height: sizeStyle.height,
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <i 
        className="ri-heart-pulse-line" 
        style={{ 
          color: 'white', 
          fontSize: sizeStyle.fontSize,
          fontWeight: 'bold'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)',
          borderRadius: '50%'
        }}
      />
    </div>
  );
}
