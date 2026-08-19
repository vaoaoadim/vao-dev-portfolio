export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/locale" && ["GET", "HEAD"].includes(request.method)) {
      const country = String(
        request.cf?.country ??
          request.headers.get("cf-ipcountry") ??
          request.headers.get("x-vercel-ip-country") ??
          "",
      ).toUpperCase();
      const body = JSON.stringify({
        country: /^[A-Z]{2}$/.test(country) ? country : null,
      });

      return new Response(request.method === "HEAD" ? null : body, {
        headers: {
          "cache-control": "no-store",
          "content-type": "application/json; charset=utf-8",
        },
      });
    }

    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const indexUrl = new URL(request.url);
    indexUrl.pathname = "/index.html";
    indexUrl.search = "";
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
