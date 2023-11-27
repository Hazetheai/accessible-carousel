import { EUR_TO_USD } from '@/constants';

export const formatPrice = (price: number, currency: string): string => {
  const value = currency === 'eur' ? price : price * EUR_TO_USD;

  return `${(Math.round(value * 100) / 100).toFixed(
    2
  )} ${currency.toUpperCase()}`;
};
