# Implementación x402 con uvd-x402-sdk

## Resumen

Esta guía documenta la implementación completa de pagos gasless usando el protocolo x402 con el SDK de Ultravioleta DAO en una aplicación React frontend-only.

## Dependencias

```bash
pnpm add uvd-x402-sdk ethers
```

## Configuración Base

### 1. Constantes de Pago

```typescript
// src/game/constants.ts
export const PAYMENT_CONFIG = {
  pricePerGame: '0.10',      // Precio en USDC (formato string)
  pricePerLife: '0.05',
  priceToContinue: '0.15',
  recipient: '0x209693BC6afC0C5328bA36FAF03c514eaD62d1B0', // Dirección con checksum EIP-55
  chain: 'avalanche' as const,
};

export const FACILITATOR_URL = 'https://facilitator.ultravioletadao.xyz';
```

> **IMPORTANTE**: La dirección del recipient debe tener el checksum EIP-55 correcto.
> Usa `ethers.getAddress(address.toLowerCase())` para obtener el checksum correcto.

### 2. Direcciones USDC por Red

| Red | USDC Address | Decimals |
|-----|--------------|----------|
| Avalanche | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` | 6 |
| Base | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 |
| Ethereum | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | 6 |
| Polygon | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` | 6 |

## Implementación del Flujo de Pago

### 3. Detección de Wallet

```typescript
interface EthereumProvider {
  isMetaMask?: boolean;
  isCoreWallet?: boolean;
  isAvalanche?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
}

const getWindowEthereum = (): EthereumProvider | undefined => {
  return (window as unknown as { ethereum?: EthereumProvider }).ethereum;
};

const getWindowAvalanche = (): EthereumProvider | undefined => {
  return (window as unknown as { avalanche?: EthereumProvider }).avalanche;
};

const detectWallet = (): { name: string; provider: EthereumProvider | null } => {
  if (typeof window === 'undefined') {
    return { name: 'No Wallet', provider: null };
  }

  const avalanche = getWindowAvalanche();
  const ethereum = getWindowEthereum();

  // Core Wallet (Avalanche native)
  if (avalanche) {
    return { name: 'Core Wallet', provider: avalanche };
  }

  if (ethereum?.isCoreWallet || ethereum?.isAvalanche) {
    return { name: 'Core Wallet', provider: ethereum };
  }

  // MetaMask
  if (ethereum?.isMetaMask) {
    return { name: 'MetaMask', provider: ethereum };
  }

  // Generic provider
  if (ethereum) {
    return { name: 'Browser Wallet', provider: ethereum };
  }

  return { name: 'No Wallet', provider: null };
};
```

### 4. Cambio de Red (Avalanche)

```typescript
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

const switchToAvalanche = async (provider: EthereumProvider) => {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: AVALANCHE_CHAIN_ID }],
    });
  } catch (switchError: unknown) {
    // Error 4902: Chain not added
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
```

### 5. Flujo Completo de Pago

```typescript
import { X402Client } from 'uvd-x402-sdk';

const handlePayment = async (amount: string, recipient: string) => {
  const { provider } = detectWallet();

  if (!provider) {
    throw new Error('No wallet detected');
  }

  // 1. Conectar wallet
  await provider.request({ method: 'eth_requestAccounts' });

  // 2. Cambiar a Avalanche
  await switchToAvalanche(provider);

  // 3. Crear cliente X402 y conectar
  const client = new X402Client({ defaultChain: 'avalanche' });
  const address = await client.connect('avalanche');

  // 4. Crear el pago (firma EIP-712)
  const result = await client.createPayment({
    recipient: recipient,
    amount: amount, // Ej: '0.10' para $0.10 USDC
  });

  // 5. Decodificar el payment header
  const paymentHeader = JSON.parse(atob(result.paymentHeader));

  // 6. Construir payment requirements
  const atomicAmount = Math.floor(parseFloat(amount) * 1e6).toString();

  const paymentRequirements = {
    scheme: 'exact',
    network: 'avalanche',
    maxAmountRequired: atomicAmount,
    resource: window.location.href,
    description: 'Payment description',
    mimeType: 'application/json',
    payTo: recipient,
    maxTimeoutSeconds: 300,
    asset: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC Avalanche
  };

  // 7. Construir settle request
  const settleRequest = {
    x402Version: paymentHeader.x402Version,
    paymentPayload: paymentHeader,
    paymentRequirements: paymentRequirements,
  };

  // 8. Enviar al facilitador
  const response = await fetch('https://facilitator.ultravioletadao.xyz/settle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settleRequest),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Payment failed');
  }

  const settleResult = await response.json();
  return {
    success: true,
    transactionHash: settleResult.transactionHash,
    address: address,
  };
};
```

## Estructura del Payment Header

El `paymentHeader` decodificado tiene esta estructura:

```json
{
  "x402Version": 1,
  "scheme": "exact",
  "network": "avalanche",
  "payload": {
    "signature": "0x...",
    "authorization": {
      "from": "0x...",      // Dirección del pagador
      "to": "0x...",        // Dirección del recipient
      "value": "100000",    // Monto en atomic units (6 decimals)
      "validAfter": "0",
      "validBefore": "1767327790",
      "nonce": "0x..."
    }
  }
}
```

## Estructura del Settle Request

```json
{
  "x402Version": 1,
  "paymentPayload": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "avalanche",
    "payload": { ... }
  },
  "paymentRequirements": {
    "scheme": "exact",
    "network": "avalanche",
    "maxAmountRequired": "100000",
    "resource": "https://...",
    "description": "...",
    "mimeType": "application/json",
    "payTo": "0x...",
    "maxTimeoutSeconds": 300,
    "asset": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"
  }
}
```

## Errores Comunes y Soluciones

### 1. Bad Address Checksum

**Error**: `bad address checksum (argument="address", value="0x...", code=INVALID_ARGUMENT)`

**Solución**:
```typescript
import { getAddress } from 'ethers';
const checksummedAddress = getAddress(address.toLowerCase());
```

### 2. Missing field `x402Version`

**Error**: `Failed to deserialize SettleRequest: missing field 'x402Version'`

**Causa**: El formato del settle request es incorrecto.

**Solución**: Asegúrate de incluir `x402Version`, `paymentPayload`, y `paymentRequirements` en el nivel raíz del objeto.

### 3. Missing field `paymentPayload`

**Error**: `missing field 'paymentPayload'`

**Solución**: El `paymentPayload` debe ser el header completo decodificado, no solo el campo `payload`.

### 4. Conflictos de Wallets

**Error en consola**: `Cannot set Core window.ethereum provider`

**Causa**: Múltiples extensiones de wallet intentan registrar `window.ethereum`.

**Solución**: Es un error cosmético, no afecta funcionalidad. El código detecta Core Wallet via `window.avalanche`.

## Redes Soportadas

El SDK soporta las siguientes redes:

- **EVM**: Base, Avalanche, Ethereum, Polygon, Arbitrum, Optimism, Celo, HyperEVM, Unichain, Monad
- **Solana/SVM**: Solana, Fogo
- **Otros**: Stellar, NEAR, Algorand, Sui

## Implementación Backend (Opcional)

Para una implementación más segura con backend:

```typescript
// Backend (Node.js/Express)
import {
  FacilitatorClient,
  extractPaymentFromHeaders,
  buildPaymentRequirements,
} from 'uvd-x402-sdk/backend';

app.post('/api/pay', async (req, res) => {
  const payment = extractPaymentFromHeaders(req.headers);

  if (!payment) {
    return res.status(402).json({ error: 'Payment required' });
  }

  const client = new FacilitatorClient();
  const requirements = buildPaymentRequirements({
    amount: '0.10',
    recipient: process.env.RECIPIENT,
    chainName: 'avalanche',
  });

  const result = await client.verifyAndSettle(payment, requirements);

  if (!result.verified) {
    return res.status(402).json({ error: result.error });
  }

  res.json({ success: true, txHash: result.transactionHash });
});
```

```typescript
// Frontend
const result = await client.createPayment({ recipient, amount });

await fetch('/api/pay', {
  headers: { 'X-PAYMENT': result.paymentHeader },
});
```

## Referencias

- [uvd-x402-sdk GitHub](https://github.com/UltravioletaDAO/uvd-x402-sdk-typescript)
- [x402 Protocol](https://www.x402.org/)
- [Coinbase x402 Docs](https://docs.cdp.coinbase.com/x402/welcome)
- [Ultravioleta Facilitator](https://facilitator.ultravioletadao.xyz/)
