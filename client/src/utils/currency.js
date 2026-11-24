export const CURRENCY_SYMBOL = '¥';
export const CURRENCY_CODE = 'CNY';

export function formatPrice(value, { withCode = false } = {}) {
  const num = Number(value);
  if (!Number.isFinite(num)) return `${CURRENCY_SYMBOL}0.00`;
  const formatted = num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY_SYMBOL}${formatted}${withCode ? ` ${CURRENCY_CODE}` : ''}`;
}

/* returns 0 when there's no valid discount */
export function discountPercent(price, originalPrice) {
  const p = Number(price);
  const o = Number(originalPrice);
  if (!Number.isFinite(p) || !Number.isFinite(o)) return 0;
  if (o <= 0 || p <= 0 || o <= p) return 0;
  return Math.round((1 - p / o) * 100);
}