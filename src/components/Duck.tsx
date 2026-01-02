import React from 'react';
import type { Duck as DuckType } from '../types/game';
import './Duck.css';

interface DuckProps {
  duck: DuckType;
}

export const DuckComponent: React.FC<DuckProps> = ({ duck }) => {
  const getStateClass = () => {
    switch (duck.state) {
      case 'shot':
        return 'duck-shot';
      case 'falling':
        return 'duck-falling';
      case 'escaped':
        return 'duck-escaped';
      default:
        return `duck-flying duck-${duck.direction}`;
    }
  };

  if (duck.state === 'escaped') return null;

  return (
    <div
      className={`duck duck-${duck.color} ${getStateClass()} frame-${duck.animationFrame} ${duck.isPowerUp ? 'duck-powerup' : ''}`}
      style={{
        left: duck.position.x,
        top: duck.position.y,
        transform: duck.direction.includes('left') ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      <div className="duck-body">
        <div className="duck-head">
          <div className="duck-eye" />
          <div className="duck-beak" />
        </div>
        <div className="duck-wing" />
        <div className="duck-tail" />
        {duck.isPowerUp && <div className="powerup-glow" />}
      </div>
    </div>
  );
};

export default DuckComponent;
