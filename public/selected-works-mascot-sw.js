const CACHE_PREFIX = "selected-works-mascot-media-";
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const MEDIA_ASSETS = [
  "/assets/selected-works/selected-work-mascot-v1.mp4",
  "/assets/selected-works/selected-work-mascot-v1-first.png",
  "/assets/selected-works/selected-work-mascot-v1-last.png",
];

const isSelectedWorksMedia = (url) =>
  url.origin === self.location.origin && MEDIA_ASSETS.includes(url.pathname);

const cacheAsset = async (cache, asset) => {
  try {
    const response = await fetch(asset, { cache: "reload" });
    if (response.ok) await cache.put(asset, response.clone());
  } catch {
    // The next successful visit retries the media cache warm-up.
  }
};

const rangedResponse = async (response, range) => {
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) return response;

  const body = await response.arrayBuffer();
  const size = body.byteLength;
  const [, startValue, endValue] = match;
  const suffixLength = startValue ? 0 : Number(endValue);
  const start = startValue
    ? Number(startValue)
    : Math.max(size - suffixLength, 0);
  const end = endValue && startValue
    ? Math.min(Number(endValue), size - 1)
    : size - 1;

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) {
    return new Response(null, {
      status: 416,
      headers: { "content-range": `bytes */${size}` },
    });
  }

  const chunk = body.slice(start, end + 1);
  return new Response(chunk, {
    status: 206,
    headers: {
      "accept-ranges": "bytes",
      "content-length": String(chunk.byteLength),
      "content-range": `bytes ${start}-${end}/${size}`,
      "content-type": response.headers.get("content-type") ?? "video/mp4",
    },
  });
};

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(MEDIA_ASSETS.map((asset) => cacheAsset(cache, asset)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!isSelectedWorksMedia(url)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url.pathname);
    const range = request.headers.get("range");

    if (cached) return range ? rangedResponse(cached, range) : cached;

    const response = await fetch(request);
    if (!range && response.ok) await cache.put(url.pathname, response.clone());
    return response;
  })());
});
