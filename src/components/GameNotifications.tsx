import React, { useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import './GameNotifications.css';

interface Notification {
  id: string;
  message: string;
  type: 'powerup' | 'health' | 'damage' | 'points';
  x: number;
  y: number;
}

export const GameNotifications: React.FC = () => {
  const { stats, ducks, gameState } = useGame();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [prevLives, setPrevLives] = useState(stats.lives);
  const [prevRapidFire, setPrevRapidFire] = useState(0);

  const addNotification = useCallback((message: string, type: Notification['type'], x?: number, y?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    const notification: Notification = {
      id,
      message,
      type,
      x: x ?? window.innerWidth / 2,
      y: y ?? window.innerHeight / 2,
    };
    setNotifications((prev) => [...prev, notification]);

    // Remove after animation
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 1500);
  }, []);

  // Detect life changes
  useEffect(() => {
    if (gameState !== 'playing') {
      setPrevLives(stats.lives);
      return;
    }

    if (stats.lives > prevLives) {
      addNotification('+1 VIDA ❤️', 'health');
    } else if (stats.lives < prevLives) {
      addNotification('-1 VIDA 💀', 'damage');
    }
    setPrevLives(stats.lives);
  }, [stats.lives, prevLives, addNotification, gameState]);

  // Detect rapid fire activation
  useEffect(() => {
    if (gameState !== 'playing') {
      setPrevRapidFire(stats.rapidFireUntil);
      return;
    }

    if (stats.rapidFireUntil > prevRapidFire && stats.rapidFireUntil > Date.now()) {
      addNotification('⚡ RAPID FIRE! ⚡', 'powerup');
    }
    setPrevRapidFire(stats.rapidFireUntil);
  }, [stats.rapidFireUntil, prevRapidFire, addNotification, gameState]);

  // ducks is used for potential future tracking of shot ducks
  // Currently notifications are triggered by stats changes
  void ducks;

  if (gameState !== 'playing') return null;

  return (
    <div className="game-notifications">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          style={{
            left: notification.x,
            top: notification.y,
          }}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default GameNotifications;
