import React, { useState, useEffect } from 'react';
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

interface EthereumProvider {
  isMetaMask?: boolean;
  isCoreWallet?: boolean;
  isAvalanche?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
}

// Access window properties with type assertions to avoid conflicts with other type definitions
const getWindowEthereum = (): EthereumProvider | undefined => {
  return (window as unknown as { ethereum?: EthereumProvider }).ethereum;
};

const getWindowAvalanche = (): EthereumProvider | undefined => {
  return (window as unknown as { avalanche?: EthereumProvider }).avalanche;
};

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

const detectWallet = (): { name: string; provider: EthereumProvider | null } => {
  if (typeof window === 'undefined') {
    return { name: 'No Wallet', provider: null };
  }

  const avalanche = getWindowAvalanche();
  const ethereum = getWindowEthereum();

  // Check for Core Wallet (Avalanche native wallet)
  if (avalanche) {
    return { name: 'Core Wallet', provider: avalanche };
  }

  if (ethereum?.isCoreWallet || ethereum?.isAvalanche) {
    return { name: 'Core Wallet', provider: ethereum };
  }

  // Check for MetaMask
  if (ethereum?.isMetaMask) {
    return { name: 'MetaMask', provider: ethereum };
  }

  // Generic ethereum provider
  if (ethereum) {
    return { name: 'Browser Wallet', provider: ethereum };
  }

  return { name: 'No Wallet', provider: null };
};

const AVALANCHE_CHAIN_ID = '0xa86a'; // 43114 in hex
const AVALANCHE_NETWORK = {
  chainId: AVALANCHE_CHAIN_ID,
  chainName: 'Avalanche C-Chain',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://snowtrace.io/'],
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ type, onClose }) => {
  const { setPaid, setWallet, startGame, buyLife, continueGame } = useGame();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'switching' | 'signing' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<{ name: string; provider: EthereumProvider | null }>({ name: 'Detecting...', provider: null });

  useEffect(() => {
    const detected = detectWallet();
    setWalletInfo(detected);
  }, []);

  const switchToAvalanche = async (provider: EthereumProvider) => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AVALANCHE_CHAIN_ID }],
      });
    } catch (switchError: unknown) {
      // Chain not added, try to add it
      if ((switchError as { code?: number })?.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [AVALANCHE_NETWORK],
        });
      } else {
        throw switchError;
      }
    }
  };

  const handlePayment = async () => {
    try {
      setStatus('connecting');
      setError(null);

      const { provider } = walletInfo;

      if (!provider) {
        throw new Error('No wallet detected. Please install Core Wallet or MetaMask.');
      }

      // Request account access
      await provider.request({ method: 'eth_requestAccounts' });

      // Switch to Avalanche network
      setStatus('switching');
      await switchToAvalanche(provider);

      // Create X402 client and connect
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
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        setError('Transaction cancelled by user');
      } else {
        setError(errorMessage);
      }
    }
  };

  const openCoreWallet = () => {
    window.open('https://core.app/', '_blank');
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

        <div className="wallet-detected">
          <span className="wallet-icon">🔗</span>
          <span className="wallet-name">{walletInfo.name}</span>
        </div>

        {status === 'idle' && walletInfo.provider && (
          <button className="payment-button" onClick={handlePayment}>
            Connect {walletInfo.name} & Pay
          </button>
        )}

        {status === 'idle' && !walletInfo.provider && (
          <div className="no-wallet">
            <p>No wallet detected</p>
            <button className="payment-button core-button" onClick={openCoreWallet}>
              Get Core Wallet
            </button>
            <p className="wallet-hint">or use MetaMask</p>
          </div>
        )}

        {status === 'connecting' && (
          <div className="payment-status">
            <div className="spinner" />
            <p>Connecting to {walletInfo.name}...</p>
          </div>
        )}

        {status === 'switching' && (
          <div className="payment-status">
            <div className="spinner" />
            <p>Switching to Avalanche...</p>
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
