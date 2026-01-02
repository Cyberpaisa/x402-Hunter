import React, { useState } from 'react';
import { X402Client } from 'uvd-x402-sdk';
import { useGame } from '../context/GameContext';
import { PAYMENT_CONFIG, FACILITATOR_URL } from '../game/constants';
import sounds from '../game/sounds';
import './PaymentModal.css';

type PaymentType = 'game' | 'life' | 'continue';

interface PaymentModalProps {
  type: PaymentType;
  onClose: () => void;
}

const PAYMENT_AMOUNTS: Record<PaymentType, string> = {
  game: PAYMENT_CONFIG.pricePerGame,
  life: PAYMENT_CONFIG.pricePerLife,
  continue: PAYMENT_CONFIG.priceToContinue,
};

const PAYMENT_TITLES: Record<PaymentType, string> = {
  game: 'Start New Game',
  life: 'Buy Extra Life',
  continue: 'Continue Playing',
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ type, onClose }) => {
  const { setPaid, setWallet, startGame, buyLife, continueGame } = useGame();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'signing' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setStatus('connecting');
      setError(null);

      const client = new X402Client({ defaultChain: PAYMENT_CONFIG.chain });
      const address = await client.connect(PAYMENT_CONFIG.chain);
      setWallet(address);

      setStatus('signing');
      const result = await client.createPayment({
        recipient: PAYMENT_CONFIG.recipient,
        amount: PAYMENT_AMOUNTS[type],
      });

      setStatus('processing');

      const response = await fetch(`${FACILITATOR_URL}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT': result.paymentHeader,
        },
        body: JSON.stringify({
          paymentHeader: result.paymentHeader,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment settlement failed');
      }

      setStatus('success');
      sounds.play('payment');

      setTimeout(() => {
        setPaid(true);

        switch (type) {
          case 'game':
            startGame();
            break;
          case 'life':
            buyLife();
            break;
          case 'continue':
            continueGame();
            break;
        }

        onClose();
      }, 1500);

    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Payment failed');
    }
  };

  return (
    <div className="payment-overlay">
      <div className="payment-modal">
        <button className="payment-close" onClick={onClose}>×</button>

        <h2 className="payment-title">{PAYMENT_TITLES[type]}</h2>

        <div className="payment-amount">
          <span className="amount-value">${PAYMENT_AMOUNTS[type]}</span>
          <span className="amount-currency">USDC</span>
        </div>

        <div className="payment-network">
          <span className="network-badge">Avalanche Network</span>
          <span className="network-info">Gasless • Instant</span>
        </div>

        {status === 'idle' && (
          <button className="payment-button" onClick={handlePayment}>
            Connect Wallet & Pay
          </button>
        )}

        {status === 'connecting' && (
          <div className="payment-status">
            <div className="spinner" />
            <p>Connecting wallet...</p>
          </div>
        )}

        {status === 'signing' && (
          <div className="payment-status">
            <div className="spinner" />
            <p>Please sign the transaction...</p>
          </div>
        )}

        {status === 'processing' && (
          <div className="payment-status">
            <div className="spinner" />
            <p>Processing payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="payment-status success">
            <span className="success-icon">✓</span>
            <p>Payment successful!</p>
          </div>
        )}

        {status === 'error' && (
          <div className="payment-status error">
            <span className="error-icon">✕</span>
            <p>{error}</p>
            <button className="retry-button" onClick={handlePayment}>
              Try Again
            </button>
          </div>
        )}

        <div className="payment-footer">
          <p>Powered by x402 Protocol</p>
          <p className="facilitator-info">
            Facilitator: {FACILITATOR_URL.replace('https://', '')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
