const IMMUTABLE_BUILD_ASSET = /^\/assets\/[^/]+-[A-Za-z0-9_-]{8,}\.(?:css|js|mjs|woff2?)$/;
const VERSIONED_SELECTED_WORKS_MEDIA = /^\/assets\/selected-works\/selected-work-mascot-v\d+(?:-(?:first|last))?\.(?:mp4|png)$/;
const ENGLISH_COUNTRIES = new Set(["US", "GB", "CA", "AU", "NZ", "IE"]);

function countryFromRequest(request) {
  return String(
    request.cf?.country ??
      request.headers.get("cf-ipcountry") ??
      request.headers.get("x-vercel-ip-country") ??
      "",
  ).toUpperCase();
}

function languageForCountry(country) {
  if (country === "RU") return "ru";
  if (ENGLISH_COUNTRIES.has(country)) return "en";
  return null;
}

function withStaticAssetCache(response, pathname) {
  if (
    !response.ok ||
    (!IMMUTABLE_BUILD_ASSET.test(pathname) &&
      !VERSIONED_SELECTED_WORKS_MEDIA.test(pathname))
  ) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function withCountryLanguageHint(response, request) {
  const language = languageForCountry(countryFromRequest(request));
  const isHtml = response.headers.get("content-type")?.includes("text/html");

  if (!response.ok || !language || !isHtml || request.method !== "GET") {
    return response;
  }

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(
    html.replace("<html ", `<html data-country-language="${language}" `),
    {
      status: response.status,
      statusText: response.statusText,
      headers,
    },
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/locale" && ["GET", "HEAD"].includes(request.method)) {
      const country = countryFromRequest(request);
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
      return withStaticAssetCache(
        await withCountryLanguageHint(response, request),
        url.pathname,
      );
    }

    const indexUrl = new URL(request.url);
    indexUrl.pathname = "/index.html";
    indexUrl.search = "";
    const appShell = await env.ASSETS.fetch(new Request(indexUrl, request));
    return withStaticAssetCache(
      await withCountryLanguageHint(appShell, request),
      indexUrl.pathname,
    );
  },
};
