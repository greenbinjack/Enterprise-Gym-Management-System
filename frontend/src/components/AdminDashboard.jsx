import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/api/admin/analytics/dashboard');
                const parsedMetrics = JSON.parse(response.data.metrics);
                setData({ metrics: parsedMetrics, alerts: response.data.equipmentAlerts });
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const handleEquipmentAction = async (id, action) => {
        const newStatus = action === 'DISPATCH_VENDOR' ? 'AVAILABLE' : 'RETIRED';
        const confirmMessage = action === 'DISPATCH_VENDOR'
            ? "Mark this machine as repaired and available?"
            : "Permanently retire this machine from the gym floor?";

        if (!window.confirm(confirmMessage)) return;

        try {
            await api.put(`/api/admin/equipment/${id}/status`, { status: newStatus });
            // Refresh the dashboard data
            const response = await api.get('/api/admin/analytics/dashboard');
            const parsedMetrics = JSON.parse(response.data.metrics);
            setData({ metrics: parsedMetrics, alerts: response.data.equipmentAlerts });
        } catch (error) {
            console.error("Failed to update equipment status", error);
            alert("Database update failed.");
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-full min-h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage"></div>
        </div>
    );

    if (!data) return (
        <div className="p-8 mt-10 max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-center rounded-2xl border border-red-200 dark:border-red-800">
            Failed to load Command Center.
        </div>
    );

    // Format Peak Hours for the chart
    const chartData = data.metrics.peakHours.map(p => ({
        time: `${p.hour}:00`,
        people: p.count
    }));

    // Custom Tooltip for Dark Mode readiness
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-darkCard p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                    <p className="font-bold text-gray-900 dark:text-cream">{label}</p>
                    <p className="text-olive dark:text-lightSage font-medium">Check-ins: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6 md:p-10 min-h-full">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-cream mb-8 tracking-tight">Command Center</h1>

            {/* Financial & Operational KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 border-l-4 border-l-olive dark:border-l-lightSage transition-transform hover:-translate-y-1">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Monthly Rev (MRR)</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">৳{data.metrics.mrr.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 border-l-4 border-l-blue-500 transition-transform hover:-translate-y-1">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Active Members</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{data.metrics.activeMembers}</p>
                </div>
                <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 border-l-4 border-l-purple-500 transition-transform hover:-translate-y-1">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Payment Success</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{data.metrics.successRate}%</p>
                </div>
                <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 border-l-4 border-l-brown transition-transform hover:-translate-y-1">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Churn Rate</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{data.metrics.churnRate}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Peak Hours Line Chart */}
                <div className="xl:col-span-2 bg-white dark:bg-darkCard p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-cream mb-6 tracking-tight">Peak Hour Utilization</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="time" stroke="#6B7280" tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#6B7280" tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="people"
                                    stroke="#8E977D" /* Olive */
                                    strokeWidth={4}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#8E977D' }}
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#DBCEA5' }} /* LightSage */
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Top Trainers */}
                    <div className="bg-white dark:bg-darkCard p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-cream mb-5 tracking-tight">Top Rated Trainers</h3>
                        <div className="space-y-3">
                            {data.metrics.topTrainers.map((t, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-darkBg rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                                    <span className="font-bold text-gray-900 dark:text-white">{t.first_name} {t.last_name}</span>
                                    <span className="text-yellow-500 font-bold bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full text-sm">⭐ {t.rating}</span>
                                </div>
                            ))}
                            {data.metrics.topTrainers.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 italic">No reviews yet.</p>}
                        </div>
                    </div>

                    {/* Inventory Maintenance Alerts */}
                    <div className="bg-white dark:bg-darkCard p-6 rounded-3xl shadow-sm border border-red-200 dark:border-red-900/30">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="text-xl">🚨</span>
                            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 tracking-tight">Maintenance Alerts</h3>
                        </div>

                        <div className="space-y-3">
                            {data.alerts.map(eq => (
                                <div key={eq.id} className="p-4 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-200 rounded-xl border border-red-100 dark:border-red-900/30 flex justify-between items-center">
                                    <span className="font-bold text-sm">{eq.name}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-red-200 dark:bg-red-800 px-2 py-1 rounded text-red-900 dark:text-white shadow-sm">
                                        {eq.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                            {data.alerts.length === 0 && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-900/30">
                                    <p className="text-sm font-bold flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        All equipment is operational.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}