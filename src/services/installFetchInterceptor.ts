import { handleFallbackApi } from './apiFallback';

export function installFetchInterceptor(): void {
  if (typeof window === 'undefined') return;
  // Prevent duplicate installation
  if ((window as any).__BKD_FETCH_INTERCEPTED__) return;
  (window as any).__BKD_FETCH_INTERCEPTED__ = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const urlStr =
      typeof input === 'string'
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url;

    const isApi = urlStr.startsWith('/api/') || urlStr.includes('/api/');
    if (!isApi) {
      return originalFetch(input, init);
    }

    const method = (init?.method || 'GET').toUpperCase();
    let bodyData: any = undefined;
    if (init?.body && typeof init.body === 'string') {
      try {
        bodyData = JSON.parse(init.body);
      } catch {
        bodyData = init.body;
      }
    }

    try {
      const response = await originalFetch(input, init);
      // If response is OK, let it through
      if (response.ok) {
        return response;
      }

      // Check content-type: if 404 from static host (e.g. Vercel returning HTML 404 page), or server down
      const contentType = response.headers.get('content-type') || '';
      const isHtmlError = !contentType.includes('application/json');

      if (response.status === 404 || response.status >= 500 || isHtmlError) {
        const fallback = handleFallbackApi(urlStr, method, bodyData);
        if (fallback) {
          return new Response(JSON.stringify(fallback.data), {
            status: fallback.status,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      return response;
    } catch {
      // Server down, network failure, or offline mode
      const fallback = handleFallbackApi(urlStr, method, bodyData);
      if (fallback) {
        return new Response(JSON.stringify(fallback.data), {
          status: fallback.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw new Error('Network error and fallback could not fulfill request');
    }
  };
}
