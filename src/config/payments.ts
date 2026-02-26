type PaymentChainConfig = {
  networkName: string;
  chainId: number;
  assetSymbol: string;
  assetAddress: string;
  assetDecimals: number;
  payToAddress: string;
  defaultExpiryMinutes: number;
  confirmationsRequired: number;
  explorerBaseUrl: string;
  explorerTxUrlPrefix: string;
  simulationMode: boolean;
};

const parseBooleanEnv = (value: string | undefined): boolean => {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
};

const simulationMode = parseBooleanEnv(
  process.env.NEXT_PUBLIC_PAYMENT_SIMULATION_MODE,
);

const simulationChainId = Number(
  process.env.NEXT_PUBLIC_PAYMENT_SIM_CHAIN_ID ?? "84532",
);

const simulationDefaults = {
  networkName:
    process.env.NEXT_PUBLIC_PAYMENT_SIM_NETWORK_NAME ?? "Base Sepolia",
  explorerUrl:
    process.env.NEXT_PUBLIC_PAYMENT_SIM_EXPLORER_URL ??
    "https://sepolia.basescan.org",
  rpcUrl: "https://sepolia.base.org",
};

export const simulationPaymentRpcUrl = simulationDefaults.rpcUrl;

const simulationConfig: PaymentChainConfig = {
  networkName: simulationDefaults.networkName,
  chainId: simulationChainId,
  assetSymbol: "USDC",
  assetAddress:
    process.env.NEXT_PUBLIC_PAYMENT_SIM_USDC_ADDRESS ??
    "0x833589fCD6eDb6E08f4c7C32D4f71b54b268B7f4",
  assetDecimals: Number(
    process.env.NEXT_PUBLIC_PAYMENT_SIM_ASSET_DECIMALS ?? "6",
  ),
  payToAddress:
    process.env.NEXT_PUBLIC_PAYMENT_SIM_PAY_TO_ADDRESS?.trim() ?? "",
  defaultExpiryMinutes: 15,
  confirmationsRequired: Number(
    process.env.NEXT_PUBLIC_PAYMENT_SIM_CONFIRMATIONS_REQUIRED ?? "2",
  ),
  explorerBaseUrl: simulationDefaults.explorerUrl,
  explorerTxUrlPrefix: `${simulationDefaults.explorerUrl}/tx/`,
  simulationMode,
};

const mainnetConfig: PaymentChainConfig = {
  networkName: "Base",
  chainId: 8453,
  assetSymbol: "USDC",
  assetAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54b268B7f4",
  assetDecimals: 6,
  payToAddress:
    process.env.NEXT_PUBLIC_PAYMENT_PAY_TO_ADDRESS?.trim() ?? "",
  defaultExpiryMinutes: 15,
  confirmationsRequired: 5,
  explorerBaseUrl: "https://basescan.org",
  explorerTxUrlPrefix: "https://basescan.org/tx/",
  simulationMode,
};

export const paymentChainConfig: PaymentChainConfig = simulationMode
  ? simulationConfig
  : mainnetConfig;

export const getOnchainNotifierConfig = () => ({
  chainId: Number(
    process.env.NEXT_PUBLIC_NOTIFICATION_CHAIN_ID ??
      String(paymentChainConfig.chainId),
  ),
  chainName:
    process.env.NEXT_PUBLIC_NOTIFICATION_CHAIN_NAME ??
    paymentChainConfig.networkName,
  rpcUrl: process.env.NEXT_PUBLIC_NOTIFICATION_RPC_URL?.trim() ?? "",
  contractAddress:
    process.env.NEXT_PUBLIC_NOTIFICATION_PUBLISHER_ADDRESS?.trim() ?? "",
});

const notifierConfig = getOnchainNotifierConfig();

export const walletNotificationChainId = notifierConfig.chainId;

export const walletNotificationChainName =
  notifierConfig.chainName ||
  (walletNotificationChainId === paymentChainConfig.chainId
    ? paymentChainConfig.networkName
    : `Chain ${walletNotificationChainId}`);

export const walletNotificationRpcUrl = notifierConfig.rpcUrl;
