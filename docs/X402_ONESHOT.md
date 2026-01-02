# x402 One-Shot Implementation

Implementación mínima para integrar pagos x402 en cualquier proyecto.

## Instalación

```bash
npm install uvd-x402-sdk
# o
pnpm add uvd-x402-sdk
```

## Código Completo (Copy-Paste Ready)

```typescript
import { X402Client } from 'uvd-x402-sdk';

// ============================================================================
// CONFIGURACIÓN - Modifica estos valores
// ============================================================================

const CONFIG = {
  recipient: '0x209693BC6afC0C5328bA36FAF03c514eaD62d1B0', // Tu dirección (checksum EIP-55)
  chain: 'avalanche' as const,                              // Red a usar
  facilitatorUrl: 'https://facilitator.ultravioletadao.xyz',
};

// Direcciones USDC por red
const USDC_ADDRESSES: Record<string, string> = {
  avalanche: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
};

// Chain IDs en hex
const CHAIN_IDS: Record<string, string> = {
  avalanche: '0xa86a',
  base: '0x2105',
  ethereum: '0x1',
  polygon: '0x89',
};

// ============================================================================
// FUNCIÓN DE PAGO
// ============================================================================

export async function payWithX402(amount: string): Promise<{
  success: boolean;
  transactionHash?: string;
  error?: string;
}> {
  try {
    // 1. Verificar wallet
    const ethereum = (window as any).ethereum || (window as any).avalanche;
    if (!ethereum) {
      throw new Error('No wallet detected. Install MetaMask or Core Wallet.');
    }

    // 2. Conectar wallet
    await ethereum.request({ method: 'eth_requestAccounts' });

    // 3. Cambiar a la red correcta
    const chainId = CHAIN_IDS[CONFIG.chain];
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (e: any) {
      if (e.code === 4902) {
        // Agregar red si no existe (ejemplo Avalanche)
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId,
            chainName: 'Avalanche C-Chain',
            nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
            rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
            blockExplorerUrls: ['https://snowtrace.io/'],
          }],
        });
      } else {
        throw e;
      }
    }

    // 4. Crear cliente X402 y pago
    const client = new X402Client({ defaultChain: CONFIG.chain });
    await client.connect(CONFIG.chain);

    const result = await client.createPayment({
      recipient: CONFIG.recipient,
      amount: amount,
    });

    // 5. Decodificar header y preparar request
    const paymentHeader = JSON.parse(atob(result.paymentHeader));
    const atomicAmount = Math.floor(parseFloat(amount) * 1e6).toString();

    const settleRequest = {
      x402Version: paymentHeader.x402Version,
      paymentPayload: paymentHeader,
      paymentRequirements: {
        scheme: 'exact',
        network: CONFIG.chain,
        maxAmountRequired: atomicAmount,
        resource: window.location.href,
        description: 'x402 Payment',
        mimeType: 'application/json',
        payTo: CONFIG.recipient,
        maxTimeoutSeconds: 300,
        asset: USDC_ADDRESSES[CONFIG.chain],
      },
    };

    // 6. Enviar al facilitador
    const response = await fetch(`${CONFIG.facilitatorUrl}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settleRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Settlement failed');
    }

    const settleResult = await response.json();
    return {
      success: true,
      transactionHash: settleResult.transactionHash,
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// USO
// ============================================================================

// Ejemplo de uso:
// const result = await payWithX402('0.10'); // Cobrar $0.10 USDC
// if (result.success) {
//   console.log('Paid! TX:', result.transactionHash);
// } else {
//   console.error('Failed:', result.error);
// }
```

## React Hook (Opcional)

```typescript
import { useState } from 'react';
import { payWithX402 } from './x402';

export function useX402Payment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async (amount: string) => {
    setLoading(true);
    setError(null);

    const result = await payWithX402(amount);

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Payment failed');
    }

    return result;
  };

  return { pay, loading, error };
}

// Uso en componente:
// const { pay, loading, error } = useX402Payment();
// <button onClick={() => pay('0.10')} disabled={loading}>
//   {loading ? 'Processing...' : 'Pay $0.10'}
// </button>
```

## Checklist de Implementación

- [ ] Instalar `uvd-x402-sdk`
- [ ] Configurar `recipient` con checksum EIP-55 correcto
- [ ] Seleccionar `chain` (avalanche, base, etc.)
- [ ] Agregar dirección USDC correcta para la red
- [ ] Probar con montos pequeños primero
- [ ] Manejar errores en UI

## Obtener Checksum Correcto

```typescript
// En Node.js o browser con ethers instalado
import { getAddress } from 'ethers';

const address = '0x209693bc6afc0c5328ba36faf03c514ead62d1b0';
const checksummed = getAddress(address);
console.log(checksummed); // 0x209693BC6afC0C5328bA36FAF03c514eaD62d1B0
```

## Notas Importantes

1. **El pago es gasless** - El usuario no paga gas, solo firma
2. **Solo USDC** - El protocolo usa USDC en todas las redes
3. **Firma EIP-712** - Segura y legible en wallets
4. **Facilitador** - Ultravioleta procesa la transacción on-chain
