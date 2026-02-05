const MOONPAY_PUBLIC_KEY = '';
// const ONRAMPER_PUBLIC_KEY = '';

export const emptyBuyQuoteAndLimits: IBuyQuoteAndLimits = {
  ltcAmount: 0,
  ltcPrice: 0,
  totalAmount: 0,
  baseCurrencyAmount: 0,
  networkFeeAmount: 0,
  feeAmount: 0,
  discount: 0,
  buyLimits: null,
};

export const emptySellQuoteAndLimits: ISellQuoteAndLimits = {
  ltcAmount: 0,
  ltcPrice: 0,
  totalAmount: 0,
  fiatAmount: 0,
  networkFeeAmount: 0,
  feeAmount: 0,
  sellLimits: null,
};

export type IBuyQuote = {
  ltcAmount: number;
  ltcPrice: number;
  totalAmount: number;
  baseCurrencyAmount: number;
  networkFeeAmount: number;
  feeAmount: number;
  discount: number;
};

export type ISellQuote = {
  ltcAmount: number;
  ltcPrice: number;
  totalAmount: number;
  fiatAmount: number;
  networkFeeAmount: number;
  feeAmount: number;
};

export type IBuyLimits = {
  minBuyAmount: number;
  maxBuyAmount: number;
  minLTCBuyAmount: number;
  maxLTCBuyAmount: number;
};

export type ISellLimits = {
  minLTCSellAmount: number;
  maxLTCSellAmount: number;
};

export type IBuyQuoteAndLimits = {
  ltcAmount: number;
  ltcPrice: number;
  totalAmount: number;
  baseCurrencyAmount: number;
  networkFeeAmount: number;
  feeAmount: number;
  discount: number;
  buyLimits: IBuyLimits | null;
};

export type ISellQuoteAndLimits = {
  ltcAmount: number;
  ltcPrice: number;
  totalAmount: number;
  fiatAmount: number;
  networkFeeAmount: number;
  feeAmount: number;
  sellLimits: ISellLimits | null;
};

export const getMoonpaySellQuoteDataUrl = (
  cryptoAmount: number,
  currencyCode: string,
): string | null => {
  // MoonPay sell quotes disabled
  return null;
};

export const getMoonpayBuyQuoteDataUrl = (
  currencyCode: string,
  cryptoAmount?: number,
  fiatAmount?: number,
): string | null => {
  // MoonPay buy quotes disabled
  return null;
};
