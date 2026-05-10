const KEY = 'aroma_order_success';

/** Called right before navigate to /order-success so state survives reload / missing router state. */
export function saveOrderSuccessState(payload) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

/**
 * Prefer React Router location.state; otherwise one-time read from sessionStorage after checkout.
 */
export function resolveOrderSuccessPayload(routerState) {
  if (routerState && typeof routerState === 'object' && routerState.fromCheckout) {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    return routerState;
  }
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return routerState ?? {};
    const parsed = JSON.parse(raw);
    sessionStorage.removeItem(KEY);
    if (parsed && typeof parsed === 'object' && parsed.fromCheckout) return parsed;
  } catch {
    /* ignore */
  }
  return routerState ?? {};
}
