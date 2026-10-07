let activeRequests = 0;
const listeners = new Set<() => void>();

function notifySubscribers() {
  listeners.forEach((listener) => listener());
}

export function startApiRequest() {
  activeRequests += 1;
  notifySubscribers();

  let finished = false;
  return () => {
    if (finished) return;
    finished = true;
    activeRequests = Math.max(0, activeRequests - 1);
    notifySubscribers();
  };
}

export function subscribeToApiLoading(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isApiLoading() {
  return activeRequests > 0;
}

export function getServerApiLoadingSnapshot() {
  return false;
}