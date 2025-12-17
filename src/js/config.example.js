// Configuration file for API keys and other sensitive data
// Copy this file to config.js and replace with your actual API keys

const CONFIG = {
  // Get your Mapbox token from: https://account.mapbox.com/access-tokens/
  MAPBOX_TOKEN: "YOUR_MAPBOX_TOKEN_HERE",
};

// Make config available globally
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
