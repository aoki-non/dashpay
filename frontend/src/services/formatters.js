/**
 * Format fiat currency with symbol and localized decimals
 */
export function formatFiat(amount, currencyCode) {
  const num = Number(amount) || 0;
  switch (currencyCode?.toUpperCase()) {
    case 'CRC':
      return `₡ ${Math.round(num).toLocaleString('en-US')}`;
    case 'SVC':
      return `₡ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'GMD':
      return `D ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'EUR':
      return `€ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'USD':
      return `$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    default:
      return `${currencyCode || ''} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

/**
 * Truncate long crypto address (e.g. 0x1234...abcd)
 */
export function truncateAddress(address, start = 6, end = 4) {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format crypto token amounts cleanly (avoiding trailing zeroes)
 */
export function formatCryptoAmount(amountStr, symbol) {
  if (!amountStr) return '0';
  const num = Number(amountStr);
  if (isNaN(num)) return amountStr;

  let formatted = '';
  if (num < 0.0001) {
    formatted = num.toExponential(4);
  } else if (num < 1) {
    formatted = num.toLocaleString('en-US', { maximumFractionDigits: 6 });
  } else if (num < 1000) {
    formatted = num.toLocaleString('en-US', { maximumFractionDigits: 4 });
  } else {
    formatted = num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  return symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Copy text to the clipboard with a fallback for browsers/WebViews
 * without the async clipboard API. Resolves true on success.
 */
export async function copyTextToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext !== false) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Return human-readable time from seconds or ISO string
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

