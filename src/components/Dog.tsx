import React from 'react';
import './Dog.css';

export type DogState = 'hidden' | 'sniffing' | 'jumping' | 'celebrating' | 'laughing';

interface DogProps {
  state: DogState;
  ducksHeld?: number; // Number of ducks to show when celebrating
}

export const Dog: React.FC<DogProps> = ({ state, ducksHeld = 0 }) => {
  if (state === 'hidden') return null;

  return (
    <div className={`dog dog-${state}`}>
      <div className="dog-body">
        {/* Ears */}
        <div className="dog-ear dog-ear-left" />
        <div className="dog-ear dog-ear-right" />

        {/* Head */}
        <div className="dog-head">
          <div className="dog-face">
            {/* Eyes */}
            <div className="dog-eyes">
              <div className={`dog-eye dog-eye-left ${state === 'laughing' ? 'eye-closed' : ''}`} />
              <div className={`dog-eye dog-eye-right ${state === 'laughing' ? 'eye-closed' : ''}`} />
            </div>
            {/* Nose */}
            <div className="dog-nose" />
            {/* Mouth */}
            <div className={`dog-mouth ${state === 'laughing' || state === 'celebrating' ? 'mouth-open' : ''}`} />
          </div>
        </div>

        {/* Body (visible when jumping/celebrating) */}
        {(state === 'jumping' || state === 'celebrating' || state === 'laughing') && (
          <div className="dog-torso">
            {/* Arms holding ducks when celebrating */}
            {state === 'celebrating' && ducksHeld > 0 && (
              <div className="dog-arms">
                <div className="dog-arm dog-arm-left">
                  <div className="held-duck" />
                </div>
                {ducksHeld > 1 && (
                  <div className="dog-arm dog-arm-right">
                    <div className="held-duck" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grass overlay for sniffing state */}
      {state === 'sniffing' && (
        <div className="dog-grass-overlay" />
      )}
    </div>
  );
};

export default Dog;
