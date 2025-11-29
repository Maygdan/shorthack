import React from 'react';

const X5Logo = ({ size = 'medium', color = 'green' }) => {
  const sizes = {
    small: { fontSize: '24px', height: '28px' },
    medium: { fontSize: '36px', height: '40px' },
    large: { fontSize: '48px', height: '52px' },
  };

  const colors = {
    green: '#00A650',
    white: '#FFFFFF',
    black: '#1A1A1A',
  };

  const style = {
    fontWeight: '800',
    letterSpacing: '-1.5px',
    color: colors[color] || colors.green,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    ...sizes[size],
  };

  const barStyle = {
    width: size === 'small' ? '6px' : size === 'large' ? '10px' : '8px',
    height: sizes[size].height,
    background: `linear-gradient(180deg, ${colors[color] || colors.green} 0%, ${color === 'white' ? '#E0E0E0' : '#008C43'} 100%)`,
    borderRadius: '999px',
  };

  return (
    <div style={style}>
      <div style={barStyle}></div>
      <span style={{ fontSize: sizes[size].fontSize }}>X5</span>
    </div>
  );
};

export default X5Logo;

