export const GA_ID = "G-P0TVVZWXQY"; // your measurement ID

export function trackEvent(eventName, params = {}) {
  if (!window.gtag) return;

  window.gtag("event", eventName, {
    ...params,
  });
}

export function trackCTA(label, category = "CTA", action = "click") {
  trackEvent("cta_click", {
    event_category: category,
    event_label: label,
    action,
  });
}
