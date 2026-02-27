export const setSessionCache = (key: string, data: any, ttlMinutes?: number) => {
    if (typeof window !== 'undefined') {
        const item = ttlMinutes !== undefined ? { value: data, expiry: new Date().getTime() + ttlMinutes * 60 * 1000 } : data;
        sessionStorage.setItem(key, JSON.stringify(item));
    }
};

export const getSessionCache = (key: string) => {
    if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem(key);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed && typeof parsed === 'object' && 'expiry' in parsed && 'value' in parsed) {
                    if (new Date().getTime() > parsed.expiry) {
                        sessionStorage.removeItem(key);
                        return null;
                    }
                    return parsed.value;
                }
                return parsed;
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
