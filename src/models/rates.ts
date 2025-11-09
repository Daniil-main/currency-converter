export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface RatesRequest {
  base?: string;
  targets: string[];
}