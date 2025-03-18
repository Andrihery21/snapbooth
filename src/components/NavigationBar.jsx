import React, { useState, useEffect } from 'react';
import { AirDrop } from './AirDrop';
import { Email } from './Email';
import { Bluetooth } from './Bluetooth';
import { Print } from './Print';
import { QRCode } from './QRCode';

export function NavigationBar({ onRetry, visible }) {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes en secondes

  useEffect(() => {
    if (!visible) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onRetry(); // Retour automatique après 2 minutes
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, onRetry]);

  if (!visible) return null;

  return (
    <div className="navigation-bar">
      <div className="timer">
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>
      
      <div className="nav-buttons">
        <AirDrop />
        <Email />
        <Bluetooth />
        <Print />
        <QRCode />
        <button className="retry-button" onClick={onRetry}>
          Retry
        </button>
      </div>

      <style jsx>{`
        .navigation-bar {
          position: fixed;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.8);
          padding: 20px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .timer {
          color: white;
          text-align: center;
          font-size: 1.2em;
          margin-bottom: 10px;
        }

        .nav-buttons {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .retry-button {
          background: #ff4444;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .retry-button:hover {
          background: #ff6666;
        }
      `}</style>
    </div>
  );
}
