import {createAction, createSlice} from '@reduxjs/toolkit';
import {PURGE} from 'redux-persist';
import {getCountry} from 'react-native-localize';

import {AppThunk, AppThunkBuyQuote, AppThunkSellQuote} from './types';
import {uuidFromSeed} from '../utils/uuid';
import {
  IBuyQuote,
  ISellQuote,
  IBuyLimits,
  ISellLimits,
  IBuyQuoteAndLimits,
  ISellQuoteAndLimits,
  getMoonpayBuyQuoteDataUrl,
  getMoonpaySellQuoteDataUrl,
  emptyBuyQuoteAndLimits,
  emptySellQuoteAndLimits,
} from '../utils/tradeQuotes';
import {ITrade, getUTCTimeStampFromMetadata} from '../utils/txMetadata';
import {fetchResolve} from '../utils/tor';

const MOONPAY_PUBLIC_KEY = '';
const ONRAMPER_PUBLIC_KEY = '';
const ONRAMPER_TEST_PUBLIC_KEY = '';

// types
interface IBuy {
  isMoonpayCustomer: boolean;
  isOnramperCustomer: boolean;
  isFlexaCustomer: boolean;
  buyQuote: IBuyQuote;
  sellQuote: ISellQuote;
  buyHistory: any[];
  sellHistory: any[];
  isBuyAllowed: boolean | null;
  isSellAllowed: boolean | null;
  buyLimits: IBuyLimits;
  sellLimits: ISellLimits;
  proceedToGetBuyLimits: boolean;
  proceedToGetSellLimits: boolean;
}

// initial state
const initialState = {
  isMoonpayCustomer: true,
  isOnramperCustomer: true,
  isFlexaCustomer: false,
  buyQuote: {
    ltcAmount: 0,
    ltcPrice: 0,
    totalAmount: 0,
    baseCurrencyAmount: 0,
    networkFeeAmount: 0,
    feeAmount: 0,
    discount: 0,
  },
  sellQuote: {
    ltcAmount: 0,
    ltcPrice: 0,
    totalAmount: 0,
    fiatAmount: 0,
    networkFeeAmount: 0,
    feeAmount: 0,
  },
  buyHistory: [],
  sellHistory: [],
  isBuyAllowed: null,
  isSellAllowed: null,
  buyLimits: {
    minBuyAmount: 0,
    maxBuyAmount: 0,
    minLTCBuyAmount: 0,
    maxLTCBuyAmount: 0,
  },
  sellLimits: {
    minLTCSellAmount: 0,
    maxLTCSellAmount: 0,
  },
  proceedToGetBuyLimits: false,
  proceedToGetSellLimits: false,
} as IBuy;

// actions
const setMoonpayCustomer = createAction<boolean>('buy/setMoonpayCustomer');
const setOnramperCustomer = createAction<boolean>('buy/setOnramperCustomer');
const setFlexaCustomer = createAction<boolean>('buy/setFlexaCustomer');
const setBuyQuoteAction = createAction<IBuyQuote>('buy/setBuyQuoteAction');
const setSellQuoteAction = createAction<ISellQuote>('buy/setSellQuoteAction');
const getBuyTxHistoryAction = createAction('buy/getBuyTxHistoryAction');
const getSellTxHistoryAction = createAction('buy/getSellTxHistoryAction');
const checkAllowedAction = createAction<{
  isBuyAllowed: boolean;
  isSellAllowed: boolean;
}>('buy/checkAllowedAction');
const setBuyLimitsAction = createAction<IBuyLimits>('buy/setBuyLimitsAction');
const setSellLimitsAction = createAction<ISellLimits>(
  'buy/setSellLimitsAction',
);
const setProceedToGetLimitsAction = createAction<{
  proceedToGetBuyLimits: boolean;
  proceedToGetSellLimits: boolean;
}>('buy/setProceedToGetLimitsAction');

// functions
export const getBuyTransactionHistory =
  (): AppThunk => async (dispatch, getState) => {
    // Buy transaction history disabled - no buy/sell provider
    dispatch(getBuyTxHistoryAction([]));
  };

export const getSellTransactionHistory =
  (): AppThunk => async (dispatch, getState) => {
    // Sell transaction history disabled - no buy/sell provider
    dispatch(getSellTxHistoryAction([]));
  };

export const checkFlexaCustomer =
  (): AppThunk => async (dispatch, getState) => {
    // Flexa not available for doriancoin
    dispatch(setFlexaCustomer(false));
  };

const getMoonpayBuyQuoteData = (
  currencyCode: string,
  torEnabled: boolean,
  cryptoAmount?: number,
  fiatAmount?: number,
) => {
  // MoonPay buy quotes disabled
  return Promise.resolve(emptyBuyQuoteAndLimits);
};

const getOnramperBuyQuoteData = (
  currencyCode: string,
  cryptoAmount?: number,
  fiatAmount?: number,
  countryCode?: string,
) => {
  // Onramper buy quotes disabled
  return Promise.resolve(emptyBuyQuoteAndLimits);
};

const getBuyQuote = (
  isMoonpayCustomer: boolean,
  isOnramperCustomer: boolean,
  currencyCode: string,
  torEnabled: boolean,
  cryptoAmount?: number,
  fiatAmount?: number,
  countryCode?: string,
) => {
  return new Promise<IBuyQuoteAndLimits>(async resolve => {
    let quote: IBuyQuoteAndLimits = {
      ltcAmount: 0,
      ltcPrice: 0,
      totalAmount: 0,
      baseCurrencyAmount: 0,
      networkFeeAmount: 0,
      feeAmount: 0,
      discount: 0,
      buyLimits: null,
    };

    try {
      if (isMoonpayCustomer) {
        quote = await getMoonpayBuyQuoteData(
          currencyCode,
          torEnabled,
          cryptoAmount,
          fiatAmount,
        );
      } else if (isOnramperCustomer) {
        quote = await getOnramperBuyQuoteData(
          currencyCode,
          cryptoAmount,
          fiatAmount,
          countryCode,
        );
      }

      resolve(quote);
    } catch (error: any) {
      // Instead of rejecting we reset quotes to indicate
      // that it's not fetched while not breaking math
      resolve(emptyBuyQuoteAndLimits);
    }
  });
};

export const setBuyQuote =
  (cryptoAmount?: number, fiatAmount?: number): AppThunkBuyQuote =>
  async (dispatch, getState) => {
    return new Promise<IBuyQuoteAndLimits>(async resolve => {
      const {isMoonpayCustomer, isOnramperCustomer} = getState().buy!;
      const {
        testPaymentActive,
        testPaymentCountry,
        testPaymentFiat,
        torEnabled,
      } = getState().settings!;

      const currencyCode = testPaymentActive
        ? testPaymentFiat
        : getState().settings!.currencyCode;
      const countryCode = testPaymentActive ? testPaymentCountry : getCountry();

      let quote: any = await getBuyQuote(
        isMoonpayCustomer,
        isOnramperCustomer,
        currencyCode,
        torEnabled,
        cryptoAmount,
        fiatAmount,
        countryCode,
      );

      // if quote does return limits update proceedToGetBuyLimits notification boolean
      dispatch(
        setProceedToGetLimitsAction({
          proceedToGetBuyLimits: quote.buyLimits
            ? false
            : getState().buy!.proceedToGetBuyLimits,
          proceedToGetSellLimits: getState().buy!.proceedToGetSellLimits,
        }),
      );

      // set sell limits if available
      if (quote.buyLimits) {
        dispatch(setBuyLimitsAction(quote.buyLimits));
      }

      // set quote
      dispatch(setBuyQuoteAction(quote));

      resolve(quote);
    });
  };

const getMoonpaySellQuoteData = (
  currencyCode: string,
  cryptoAmount: number,
) => {
  // MoonPay sell quotes disabled
  return Promise.resolve(emptySellQuoteAndLimits);
};

const getSellQuote = (
  isMoonpayCustomer: boolean,
  isOnramperCustomer: boolean,
  currencyCode: string,
  cryptoAmount: number,
) => {
  return new Promise<ISellQuoteAndLimits>(async resolve => {
    let quote: ISellQuoteAndLimits = {
      ltcAmount: 0,
      ltcPrice: 0,
      totalAmount: 0,
      fiatAmount: 0,
      networkFeeAmount: 0,
      feeAmount: 0,
      sellLimits: null,
    };

    try {
      if (isMoonpayCustomer) {
        quote = await getMoonpaySellQuoteData(currencyCode, cryptoAmount);
      } else if (isOnramperCustomer) {
        // not supported by onramper
        // quote = await getOnramperSellQuoteData(
        //   currencyCode,
        //   cryptoAmount,
        //   countryCode,
        // );
      }

      resolve(quote);
    } catch (error: any) {
      // Instead of rejecting we reset quotes to indicate
      // that it's not fetched while not breaking math
      resolve(emptySellQuoteAndLimits);
    }
  });
};

export const setSellQuote =
  (cryptoAmount: number): AppThunkSellQuote =>
  async (dispatch, getState) => {
    return new Promise<ISellQuoteAndLimits>(async resolve => {
      const {isMoonpayCustomer, isOnramperCustomer} = getState().buy!;
      const {testPaymentActive, testPaymentFiat} = getState().settings!;

      const currencyCode = testPaymentActive
        ? testPaymentFiat
        : getState().settings!.currencyCode;

      const quote: ISellQuoteAndLimits = await getSellQuote(
        isMoonpayCustomer,
        isOnramperCustomer,
        currencyCode,
        cryptoAmount,
      );

      // if quote does return limits update proceedToGetSellLimits notification boolean
      dispatch(
        setProceedToGetLimitsAction({
          proceedToGetBuyLimits: getState().buy!.proceedToGetBuyLimits,
          proceedToGetSellLimits: quote.sellLimits
            ? false
            : getState().buy!.proceedToGetSellLimits,
        }),
      );

      // set sell limits if available
      if (quote.sellLimits) {
        dispatch(setSellLimitsAction(quote.sellLimits));
      }

      // set quote
      if (isMoonpayCustomer) {
        dispatch(setSellQuoteAction(quote));
      }

      resolve(quote);
    });
  };

export const checkBuySellProviderCountry =
  (): AppThunk => (dispatch, getState) => {
    // Buy/sell not available for doriancoin
    dispatch(setMoonpayCustomer(false));
    dispatch(setOnramperCustomer(false));
    dispatch(
      checkAllowedAction({
        isBuyAllowed: false,
        isSellAllowed: false,
      }),
    );
  };

export const checkAllowed = (): AppThunk => async (dispatch, getState) => {
  // Buy/sell not available for doriancoin
  dispatch(
    checkAllowedAction({
      isBuyAllowed: false,
      isSellAllowed: false,
    }),
  );
};

const checkMoonpayAllowed = (): AppThunk => async (dispatch, getState) => {
  // MoonPay not available for doriancoin
  dispatch(
    checkAllowedAction({
      isBuyAllowed: false,
      isSellAllowed: false,
    }),
  );
};

const checkOnramperAllowed = (): AppThunk => async (dispatch, getState) => {
  // Onramper not available for doriancoin
  dispatch(
    checkAllowedAction({
      isBuyAllowed: false,
      isSellAllowed: false,
    }),
  );
};

const _checkOnramperAllowed_disabled = (): AppThunk => async (dispatch, getState) => {
  const {testPaymentActive, testPaymentCountry, testPaymentFiat} =
    getState().settings!;

  const currencyCode = testPaymentActive
    ? testPaymentFiat
    : getState().settings!.currencyCode;
  const countryCode = testPaymentActive ? testPaymentCountry : getCountry();

  const supportedForBuying = `https://api.onramper.com/supported/assets?source=${currencyCode}&type=buy&country=${countryCode}`;
  const supportedForSelling = `https://api.onramper.com/supported/assets?source=ltc_litecoin&type=sell&country=${countryCode}`;

  let canBuy: boolean = false;
  let canSell: boolean = false;

  const req = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      Authorization: ONRAMPER_PUBLIC_KEY,
    },
  };

  // ONRAMPER_TEST_PUBLIC_KEY returns forbidden res
  // const req = {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     accept: 'application/json',
  //     Authorization:
  //       testPaymentActive && testPaymentKey
  //         ? ONRAMPER_TEST_PUBLIC_KEY
  //         : ONRAMPER_PUBLIC_KEY,
  //   },
  // };

  try {
    const res = await fetch(supportedForBuying, req);
    if (res.ok) {
      const data = await res.json();
      if (data.hasOwnProperty('message')) {
        if (data.message.hasOwnProperty('assets')) {
          if (data.message.assets[0].crypto.includes('ltc_litecoin')) {
            canBuy = true;
          }
        }
      }
    }

    const res2 = await fetch(supportedForSelling, req);
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.hasOwnProperty('message')) {
        if (data2.message.hasOwnProperty('assets')) {
          if (
            data2.message.assets[0].fiat.includes(currencyCode.toLowerCase())
          ) {
            canSell = true;
          }
        }
      }
    }

    dispatch(
      checkAllowedAction({
        isBuyAllowed: canBuy,
        isSellAllowed: canSell,
      }),
    );
  } catch (error) {
    console.error(error);
  }
};

export const getMoonpayLimits = (): AppThunk => async (dispatch, getState) => {
  // MoonPay limits disabled
  return;
};

const getOnramperLimits = (): AppThunk => async dispatch => {
  // set limits when possible
  // TODO: get actual limits when it's working on onramper's end
  // const buyLimits = {
  //   minBuyAmount: 10,
  //   maxBuyAmount: 10000,
  //   minLTCBuyAmount: 0.1,
  //   maxLTCBuyAmount: 100,
  // };
  // dispatch(setBuyLimitsAction(buyLimits));
  // const sellLimits = {
  //   minLTCSellAmount: 0.01,
  //   maxLTCSellAmount: 999,
  // };
  // dispatch(setSellLimitsAction(sellLimits));

  // set proceedToGetLimits if there's no general limits
  // NOTE: limits can be set after getting a quote
  dispatch(
    setProceedToGetLimitsAction({
      proceedToGetBuyLimits: true,
      proceedToGetSellLimits: true,
    }),
  );
};

export const setLimits = (): AppThunk => async (dispatch, getState) => {
  const {isMoonpayCustomer, isOnramperCustomer} = getState().buy!;
  if (isMoonpayCustomer) {
    dispatch(getMoonpayLimits());
  } else if (isOnramperCustomer) {
    dispatch(getOnramperLimits());
  } else {
    return;
  }
};

export const getSignedUrl =
  (address: string, fiatAmount: number, prefilledMethod?: string): AppThunk =>
  (_, getState) => {
    // MoonPay buy disabled
    return Promise.resolve('');
  };

export const getSignedOnramperUrl =
  (address: string, fiatAmount: number, prefilledMethod?: string): AppThunk =>
  (_, getState) => {
    // Onramper buy disabled
    return Promise.resolve('');
  };

export const getSignedSellUrl =
  (address: string, ltcAmount: number, prefilledMethod?: string): AppThunk =>
  (dispatch, getState) => {
    // MoonPay sell disabled
    return Promise.resolve('');
  };

export const getSignedSellOnramperUrl =
  (address: string, cryptoAmount: number, prefilledMethod?: string): AppThunk =>
  (_, getState) => {
    // Onramper sell disabled
    return Promise.resolve('');
  };

// slice
export const buySlice = createSlice({
  name: 'buy',
  initialState,
  reducers: {
    getBuyTxHistoryAction: (state, action) => ({
      ...state,
      buyHistory: action.payload,
    }),
    getSellTxHistoryAction: (state, action) => ({
      ...state,
      sellHistory: action.payload,
    }),
    setBuyQuoteAction: (state, action) => ({
      ...state,
      buyQuote: action.payload,
    }),
    setSellQuoteAction: (state, action) => ({
      ...state,
      sellQuote: action.payload,
    }),
    checkAllowedAction: (state, action) => ({
      ...state,
      isBuyAllowed: action.payload.isBuyAllowed,
      isSellAllowed: action.payload.isSellAllowed,
    }),
    setBuyLimitsAction: (state, action) => ({
      ...state,
      buyLimits: action.payload,
    }),
    setSellLimitsAction: (state, action) => ({
      ...state,
      sellLimits: action.payload,
    }),
    setProceedToGetLimitsAction: (state, action) => ({
      ...state,
      proceedToGetBuyLimits: action.payload.proceedToGetBuyLimits,
      proceedToGetSellLimits: action.payload.proceedToGetSellLimits,
    }),
    setMoonpayCustomer: (state, action) => ({
      ...state,
      isMoonpayCustomer: action.payload,
    }),
    setOnramperCustomer: (state, action) => ({
      ...state,
      isOnramperCustomer: action.payload,
    }),
    setFlexaCustomer: (state, action) => ({
      ...state,
      isFlexaCustomer: action.payload,
    }),
  },
  extraReducers: builder => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

export default buySlice.reducer;

export const moonpayCountries = [
  // eurozone
  'BE',
  'DE',
  'EE',
  'IE',
  'EL',
  'ES',
  'FR',
  'HR',
  'IT',
  'CY',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'AT',
  'PT',
  'SI',
  'SK',
  'FI',
  // uk & usa
  'GB',
  'US',
];

export const onramperCountries = [
  // North America (excluding usa)
  'CA',
  'MX',
  'BM',
  'GL',
  'PM',

  // Central America & Caribbean
  'BZ',
  'CR',
  'SV',
  'GT',
  'HN',
  'NI',
  'PA',
  'AG',
  'AI',
  'AW',
  'BB',
  'BL',
  'BQ',
  'BS',
  'CU',
  'CW',
  'DM',
  'DO',
  'GD',
  'GP',
  'HT',
  'JM',
  'KN',
  'KY',
  'LC',
  'MF',
  'MS',
  'PR',
  'TC',
  'TT',
  'VC',
  'VG',
  'VI',

  // South America
  'AR',
  'BO',
  'BR',
  'CL',
  'CO',
  'EC',
  'FK',
  'GF',
  'GY',
  'PE',
  'PY',
  'SR',
  'UY',
  'VE',

  // Europe (exlcuding eurozone + uk)
  'IS',
  'SJ',
  'AL',
  'CH',
  'UA',
  'SE',
  'BG',
  'RO',
  'FO',
  'AD',
  'JE',
  'GG',
  'MK',
  'LI',
  'PL',
  'XK',
  'MD',
  'CZ',
  'DK',
  'HU',
  'MC',
  'VA',
  'SM',
  'GI',
  'ME',
  'NO',
  'IM',

  // Africa
  'AO',
  'BJ',
  'BW',
  'BF',
  'BI',
  'CV',
  'CM',
  'CF',
  'TD',
  'KM',
  'CD',
  'DJ',
  'GQ',
  'ER',
  'SZ',
  'ET',
  'GA',
  'GM',
  'GH',
  'GN',
  'GW',
  'CI',
  'KE',
  'LS',
  'LR',
  'MG',
  'MW',
  'ML',
  'MR',
  'MU',
  'YT',
  'MZ',
  'NA',
  'NE',
  'NG',
  'RW',
  'ST',
  'SN',
  'SC',
  'SL',
  'SH',
  'TG',
  'TZ',
  'UG',
  'ZM',
  'ZW',

  // Asia
  'BH',
  'BD',
  'BN',
  'KH',
  'CN',
  'HK',
  'IN',
  'ID',
  'IL',
  'JP',
  'JO',
  'KZ',
  'KW',
  'KG',
  'LA',
  'LB',
  'MO',
  'MY',
  'MV',
  'MN',
  'MM',
  'NP',
  'OM',
  'PK',
  'PS',
  'PH',
  'QA',
  'SA',
  'SG',
  'KR',
  'LK',
  'SY',
  'TJ',
  'TH',
  'TL',
  'TM',
  'AE',
  'UZ',
  'VN',
  'YE',

  // Oceania
  'AS',
  'AU',
  'CX',
  'CC',
  'CK',
  'FJ',
  'GU',
  'KI',
  'MH',
  'FM',
  'NR',
  'NC',
  'NZ',
  'NU',
  'NF',
  'MP',
  'PW',
  'PG',
  'PN',
  'WS',
  'SB',
  'TK',
  'TO',
  'TV',
  'VU',
  'WF',

  // Antarctica & Outlying Territories
  'AQ',
];
