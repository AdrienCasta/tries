import "@testing-library/jest-dom/vitest";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Polyfill for hasPointerCapture (needed for Radix UI Select component)
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = function () {
    return false;
  };
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = function () {};
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = function () {};
}

// Polyfill for scrollIntoView (needed for Radix UI Select component)
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {};
}

global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = input.toString();

  if (url.includes('/api/helpers/onboard')) {
    return new Response(
      JSON.stringify({ message: 'Helper onboarded successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
};
