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

    const debtors = data.metrics.debtorListActive || [];
    const revenueRollup = data.metrics.monthlyRevenueRollup || [];

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
        <div className="p-6 md:p-8 min-h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-cream tracking-tighter">Command Center</h1>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Vortex Analytics & Operations Overview</p>
                </div>
                <div className="mt-4 md:mt-0 text-sm font-bold text-olive dark:text-lightSage bg-olive/10 dark:bg-lightSage/10 px-4 py-2 rounded-xl">
                    Live Session Active
                </div>
            </div>

            {/* Top Row: Core KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                <div className="bg-white dark:bg-darkCard p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gray-50 dark:bg-darkBg rounded-2xl group-hover:bg-olive/10 dark:group-hover:bg-lightSage/10 transition-colors">
                            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-olive dark:group-hover:text-lightSage" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Monthly Rev (MRR)</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">৳{data.metrics.mrr.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-darkCard p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gray-50 dark:bg-darkBg rounded-2xl group-hover:bg-blue-500/10 transition-colors">
                            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Active Members</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{data.metrics.activeMembers}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-darkCard p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gray-50 dark:bg-darkBg rounded-2xl group-hover:bg-purple-500/10 transition-colors">
                            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Payment Success</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{data.metrics.successRate}%</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-darkCard p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gray-50 dark:bg-darkBg rounded-2xl group-hover:bg-amber-500/10 transition-colors">
                            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                        </div>
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Churn Rate</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{data.metrics.churnRate}%</p>
                    </div>
                </div>
            </div>

            {/* Middle Row: Main Chart & Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white dark:bg-darkCard p-6 lg:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-black text-gray-900 dark:text-cream mb-6 tracking-tight">Peak Hour Utilization</h3>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                                <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8E977D', strokeWidth: 2, opacity: 0.2 }} />
                                <Line
                                    type="monotone"
                                    dataKey="people"
                                    stroke="#8E977D"
                                    strokeWidth={4}
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#DBCEA5' }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-darkCard p-6 lg:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                    <h3 className="text-lg font-black text-gray-900 dark:text-cream mb-6 tracking-tight">Revenue Rollup</h3>
                    <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-[320px]">
                        {revenueRollup.map((r, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-darkBg rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                                <div>
                                    <p className="text-xs font-black text-gray-800 dark:text-cream uppercase tracking-wider">{r.plan_type}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">{new Date(r.revenue_month).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</p>
                                </div>
                                <p className="text-sm font-black text-olive dark:text-lightSage">৳{Number(r.total_income || 0).toLocaleString()}</p>
                            </div>
                        ))}
                        {revenueRollup.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">No invoice data recorded.</p>}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Lists & Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {/* Top Trainers */}
                <div className="bg-white dark:bg-darkCard p-6 lg:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-black text-gray-900 dark:text-cream mb-6 tracking-tight">Trainer Retention</h3>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                        {data.metrics.topTrainers.map((t, i) => (
                            <div key={i} className="flex justify-between items-center px-1 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                <span className="font-bold text-sm text-gray-800 dark:text-cream">{t.rank_position}. {t.first_name} {t.last_name}</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded shadow-sm">{t.retention_rate}%</span>
                            </div>
                        ))}
                        {data.metrics.topTrainers.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400 font-medium italic">No attendance data compiled.</p>}
                    </div>
                </div>

                {/* Active Debtors */}
                <div className="bg-white dark:bg-darkCard p-6 lg:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[4rem] pointer-events-none"></div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-cream mb-6 tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Active Debtors
                    </h3>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 relative z-10">
                        {debtors.map((d, i) => (
                            <div key={i} className="flex flex-col p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-bold text-gray-900 dark:text-cream text-sm">{d.first_name} {d.last_name}</p>
                                    <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">{d.overdue_invoices} Inv</span>
                                </div>
                                <p className="text-xs font-bold text-amber-600 dark:text-amber-500">Owes: ৳{Number(d.overdue_amount || 0).toLocaleString()}</p>
                            </div>
                        ))}
                        {debtors.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400 font-medium italic">No checked-in debtors.</p>}
                    </div>
                </div>

                {/* Maintenance Alerts */}
                <div className="bg-white dark:bg-darkCard p-6 lg:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-[4rem] pointer-events-none"></div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-cream mb-6 tracking-tight flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${data.alerts.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                        System Alerts
                    </h3>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2 relative z-10">
                        {data.alerts.map(eq => (
                            <div key={eq.id} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100/50 dark:border-red-900/30 flex justify-between items-center group">
                                <span className="font-bold text-sm text-red-900 dark:text-red-200">{eq.name}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded text-red-800 dark:text-red-300">
                                    {eq.status.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                        {data.alerts.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-center">
                                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <p className="text-sm font-bold text-green-700 dark:text-green-400">All Systems Nominal</p>
                                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">No equipment requires maintenance.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}