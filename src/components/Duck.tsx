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

  const getTypeClass = () => {
    switch (duck.duckType) {
      case 'powerup':
        return 'duck-powerup';
      case 'bad':
        return 'duck-bad';
      default:
        return '';
    }
  };

  return (
    <div
      className={`duck duck-${duck.color} ${getStateClass()} ${getTypeClass()} frame-${duck.animationFrame}`}
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
        {duck.duckType === 'powerup' && <div className="powerup-glow" />}
        {duck.duckType === 'bad' && <div className="bad-glow" />}
      </div>
      {/* Visual indicator icons */}
      {duck.duckType === 'powerup' && <div className="duck-type-icon powerup-icon">⭐</div>}
      {duck.duckType === 'bad' && <div className="duck-type-icon bad-icon">💀</div>}
    </div>
  );
};

export default DuckComponent;
