"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { createClient, defineChain, type Chain } from "viem";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

import {
  paymentChainConfig,
  simulationPaymentRpcUrl,
  walletNotificationChainId,
  walletNotificationChainName,
  walletNotificationRpcUrl,
} from "@/config/payments";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

const queryClient = new QueryClient();
const shouldEnableWalletConnect =
  typeof window !== "undefined" && Boolean(walletConnectProjectId);

const connectors = [
  injected({ shimDisconnect: true }),
  ...(shouldEnableWalletConnect
    ? [
        walletConnect({
          projectId: walletConnectProjectId as string,
          showQrModal: false,
          logger: "error",
          metadata: {
            name: "DCS Store",
            description: "DCS Store checkout",
            url: siteUrl,
            icons: [],
          },
        }),
      ]
    : []),
];

const knownWalletChains = [base, baseSepolia] as const;
type WalletChain = (typeof knownWalletChains)[number] | Chain;

const fallbackChain = paymentChainConfig.simulationMode ? baseSepolia : base;
const customPaymentChain = !knownWalletChains.some(
  (chain) => chain.id === paymentChainConfig.chainId,
)
  ? defineChain({
      id: paymentChainConfig.chainId,
      name: paymentChainConfig.networkName,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: {
          http: [
            simulationPaymentRpcUrl || fallbackChain.rpcUrls.default.http[0],
          ],
        },
      },
      blockExplorers: {
        default: {
          name: paymentChainConfig.networkName,
          url: paymentChainConfig.explorerBaseUrl,
        },
      },
    })
  : null;

const paymentChain =
  knownWalletChains.find((chain) => chain.id === paymentChainConfig.chainId) ??
  customPaymentChain ??
  fallbackChain;

const builtInNotificationChain = knownWalletChains.find(
  (chain) => chain.id === walletNotificationChainId,
);
const customNotificationChain =
  !builtInNotificationChain && walletNotificationRpcUrl
    ? defineChain({
        id: walletNotificationChainId,
        name: walletNotificationChainName,
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: {
          default: { http: [walletNotificationRpcUrl] },
        },
        blockExplorers: {
          default: { name: walletNotificationChainName, url: siteUrl },
        },
      })
    : null;

const notificationChain = builtInNotificationChain ?? customNotificationChain;

const walletBaseChains: WalletChain[] = [
  paymentChain,
  ...knownWalletChains.filter((chain) => chain.id !== paymentChain.id),
];

if (
  notificationChain &&
  !walletBaseChains.some((chain) => chain.id === notificationChain.id)
) {
  walletBaseChains.push(notificationChain);
}

const activeChains = walletBaseChains as [WalletChain, ...WalletChain[]];

const config = createConfig({
  chains: activeChains,
  connectors,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(chain.rpcUrls.default.http[0]),
    });
  },
  ssr: true,
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
