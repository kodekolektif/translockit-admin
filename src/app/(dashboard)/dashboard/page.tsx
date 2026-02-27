'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Users, FileText, Layers, Eye, MousePointerClick } from 'lucide-react';
import { apiClient } from '@/core/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

interface DashboardData {
    total_users: number;
    total_articles: number;
    total_categories: number;
    active_sessions: number;
}

interface AnalyticsData {
    total_visitors: number;
    page_views: number;
    top_browsers: { browser: string; sessions: number }[];
    top_countries: { country: string; active_users: number }[];
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

import { getSessionCache, setSessionCache } from '@/core/api/cache';

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const cachedDashboard = getSessionCache('cache_/dashboard');
                const cachedAnalytics = getSessionCache('cache_/analytics');

                let fetchedDashboard = cachedDashboard;
                let fetchedAnalytics = cachedAnalytics;

                const promises = [];
                if (!cachedDashboard) promises.push(apiClient.get('/dashboard'));
                else promises.push(Promise.resolve(null));

                if (!cachedAnalytics) promises.push(apiClient.get('/analytics'));
                else promises.push(Promise.resolve(null));

                const [dashboardRes, analyticsRes] = await Promise.allSettled(promises);

                if (!cachedDashboard && dashboardRes.status === 'fulfilled' && dashboardRes.value) {
                    fetchedDashboard = dashboardRes.value.data?.data || dashboardRes.value.data;
                    if (fetchedDashboard) setSessionCache('cache_/dashboard', fetchedDashboard, 30);
                }

                if (!cachedAnalytics && analyticsRes.status === 'fulfilled' && analyticsRes.value) {
                    fetchedAnalytics = analyticsRes.value.data?.data || analyticsRes.value.data;
                    if (fetchedAnalytics) setSessionCache('cache_/analytics', fetchedAnalytics, 30);
                }

                if (fetchedDashboard) setData(fetchedDashboard);
                if (fetchedAnalytics) setAnalytics(fetchedAnalytics);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper to find active users for a given country name from the map's geo properties
    const getCountryUsers = (geoName: string) => {
        if (!analytics?.top_countries) return 0;
        const match = analytics.top_countries.find(c => c.country.toLowerCase() === geoName.toLowerCase());
        return match ? match.active_users : 0;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Overview</h2>

            {/* Main Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{data?.total_users ?? '--'}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{data?.total_articles ?? '--'}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <Layers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{data?.total_categories ?? '--'}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{data?.active_sessions ?? '--'}</div>}
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Stats & Browsers */}
            <div className="grid gap-4 md:grid-cols-2">

                {/* Stats Column */}
                <div className="flex flex-col space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{analytics?.total_visitors ?? '--'}</div>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{analytics?.page_views ?? '--'}</div>}
                        </CardContent>
                    </Card>
                </div>

                {/* Pie Chart Column */}
                <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle>Top Browsers</CardTitle>
                        <CardDescription>Sessions by browser type</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-4">
                        {loading ? (
                            <div className="flex items-center justify-center h-full"><Skeleton className="h-40 w-40 rounded-full" /></div>
                        ) : analytics?.top_browsers ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.top_browsers}
                                        cx="60%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        paddingAngle={5}
                                        dataKey="sessions"
                                        nameKey="browser"
                                    >
                                        {analytics.top_browsers.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend layout="vertical" verticalAlign="middle" align="left" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Maps Row */}
            <div className="grid gap-4 grid-cols-1">
                <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle>Top Countries</CardTitle>
                        <CardDescription>Users by geography</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] overflow-hidden flex items-center justify-center flex-1 pb-4">
                        {loading ? (
                            <div className="flex items-center justify-center h-full"><Skeleton className="h-full w-full" /></div>
                        ) : (
                            <ComposableMap projectionConfig={{ scale: 180 }} style={{ width: "100%", height: "100%" }}>
                                <Geographies geography={geoUrl}>
                                    {({ geographies }) =>
                                        geographies.map((geo) => {
                                            const activeUsers = getCountryUsers(geo.properties.name);
                                            const hasUsers = activeUsers > 0;
                                            return (
                                                <Geography
                                                    key={geo.rsmKey}
                                                    geography={geo}
                                                    fill={hasUsers ? "#3b82f6" : "#e2e8f0"}
                                                    stroke="#ffffff"
                                                    strokeWidth={0.5}
                                                    style={{
                                                        default: { outline: "none" },
                                                        hover: { fill: hasUsers ? "#2563eb" : "#cbd5e1", outline: "none" },
                                                        pressed: { outline: "none" },
                                                    }}
                                                />
                                            );
                                        })
                                    }
                                </Geographies>
                            </ComposableMap>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
