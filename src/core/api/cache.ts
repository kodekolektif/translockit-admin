export const setSessionCache = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, JSON.stringify(data));
    }
};

export const getSessionCache = (key: string) => {
    if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem(key);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                return null;
            }
        }
    }
    return null;
};

export const clearSessionCacheByPrefix = (prefix: string) => {
    if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    }
};
