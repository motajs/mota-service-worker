import { ResponseUtils } from "./utils";

const fetchCachePromise = caches.open("fetch");

export const networkFirst = async (request: Request) => {
    const fetchCache = await fetchCachePromise;
    return await fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                fetchCache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(async () => {
            const cachedResponse = await fetchCache.match(request);
            return cachedResponse ?? Response.error();
        });
}

export const cacheFirstWithRefresh = async (request: Request) => {
    const fetchCache = await fetchCachePromise;
    const fetchResponsePromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                fetchCache.put(request, networkResponse.clone());
            }
            return networkResponse;
        }).catch(() => Response.error());
  
    return (await fetchCache.match(request)) ?? (await fetchResponsePromise);
}

export const cacheFirst = async (request: Request) => {
    const fetchCache = await fetchCachePromise;
    const cachedResponse = await fetchCache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    return await fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                fetchCache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => ResponseUtils.create404());
}
