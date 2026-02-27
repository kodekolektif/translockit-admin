import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

import { getSessionCache, setSessionCache } from '../api/cache';

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface PaginatedResponse<T> extends PaginationMeta {
    data: T[];
}

export interface UseDataTableOptions {
    endpoint: string;
    queryKey: string[];
}

export function useDataTable<T>({ endpoint, queryKey }: UseDataTableOptions) {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('');
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

    const fetcher = async () => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('per_page', perPage.toString());
        if (search) params.append('search', search);
        if (sort) {
            params.append('sort', sort);
            params.append('direction', direction);
        }

        const queryString = params.toString();
        const cacheKey = `cache_${endpoint}?${queryString}`;

        const cachedData = getSessionCache(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        const { data } = await apiClient.get<PaginatedResponse<T>>(`${endpoint}?${queryString}`);

        setSessionCache(cacheKey, data);

        return data;
    };

    const query = useQuery({
        queryKey: [...queryKey, page, perPage, search, sort, direction],
        queryFn: fetcher,
        staleTime: Infinity, // Rely on our explicit sessionStorage invalidation instead
        placeholderData: (prev) => prev, // keeps previous data while fetching new
    });

    const handleSort = useCallback((column: string) => {
        if (sort === column) {
            setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSort(column);
            setDirection('asc');
        }
    }, [sort]);

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        setPage(1); // Reset page on new search
    }, []);

    return {
        ...query,
        data: query.data?.data || [],
        meta: {
            current_page: query.data?.current_page || 1,
            last_page: query.data?.last_page || 1,
            total: query.data?.total || 0,
            per_page: query.data?.per_page || 10,
        },
        state: {
            page,
            perPage,
            search,
            sort,
            direction,
        },
        actions: {
            setPage,
            setPerPage,
            handleSearch,
            handleSort,
        },
    };
}
