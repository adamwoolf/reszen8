window.Reszen8Embed = function ({ containerId = "reszen8", tenant = "default", token }) {
  const APP_ORIGIN = window.location.hostname.includes("localhost") ? "http://localhost:5173" : "https://reszen8.com";

  const allowedOrigins = [APP_ORIGIN];

  const container = document.getElementById(containerId) || document.body;

  const iframe = document.createElement("iframe");
  iframe.src = `${APP_ORIGIN}?tenant=${encodeURIComponent(tenant)}`;
  iframe.title = "RESZEN8";
  iframe.sandbox = "allow-scripts allow-forms allow-same-origin allow-popups";
  iframe.style.width = "100%";
  iframe.style.height = "100vh";
  iframe.style.border = "0";

  container.appendChild(iframe);

  let iframeReady = false;

  function postToIframe(message) {
    if (!iframe.contentWindow) return;
    iframe.contentWindow.postMessage(message, APP_ORIGIN);
  }

  function sendAuthToken(token) {
    postToIframe({ type: "AUTH_TOKEN", token });
  }

  // Listen for messages from iframe
  window.addEventListener("message", (event) => {
    if (!allowedOrigins.includes(event.origin)) return;
    const { type } = event.data || {};

    if (type === "IFRAME_READY") {
      iframeReady = true;
      if (token) sendAuthToken(token);
    }
  });

  // Optional: allow token update
  return {
    sendToken(newToken) {
      token = newToken;
      if (iframeReady) sendAuthToken(token);
    },
    setTenant(newTenant) {
      tenant = newTenant;
      iframe.src = `${APP_ORIGIN}?tenant=${encodeURIComponent(tenant)}`;
      iframeReady = false;
    },
    reload() {
      iframe.contentWindow.location.reload();
    },
  };
};
