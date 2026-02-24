import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/admin/analytics/dashboard');
                // Parse the Postgres JSON string
                const parsedMetrics = JSON.parse(response.data.metrics);
                setData({ metrics: parsedMetrics, alerts: response.data.equipmentAlerts });
            } catch (error) { console.error("Failed to load analytics", error); }
            finally { setIsLoading(false); }
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
            // HERE IS YOUR UPDATED URL (Calling the Operations Controller!)
            await axios.put(`http://localhost:8080/api/admin/equipment/${id}/status`, {
                status: newStatus
            });

            // Refresh the dashboard data so the machine disappears instantly
            const response = await axios.get('http://localhost:8080/api/admin/analytics/dashboard');
            const parsedMetrics = JSON.parse(response.data.metrics);
            setData({ metrics: parsedMetrics, alerts: response.data.equipmentAlerts });
        } catch (error) {
            console.error("Failed to update equipment status", error);
            alert("Database update failed.");
        }
    };

    if (isLoading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (!data) return <div className="p-8 text-center text-red-600">Failed to load Command Center.</div>;

    // Format Peak Hours for the chart
    const chartData = data.metrics.peakHours.map(p => ({
        time: `${p.hour}:00`,
        people: p.count
    }));

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Command Center</h1>

            {/* Financial & Operational KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500">
                    <p className="text-sm font-medium text-gray-500 uppercase">Monthly Rev (MRR)</p>
                    <p className="text-3xl font-black text-gray-900">৳{data.metrics.mrr.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500">
                    <p className="text-sm font-medium text-gray-500 uppercase">Active Members</p>
                    <p className="text-3xl font-black text-gray-900">{data.metrics.activeMembers}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-purple-500">
                    <p className="text-sm font-medium text-gray-500 uppercase">Payment Success</p>
                    <p className="text-3xl font-black text-gray-900">{data.metrics.successRate}%</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-red-500">
                    <p className="text-sm font-medium text-gray-500 uppercase">Churn Rate</p>
                    <p className="text-3xl font-black text-gray-900">{data.metrics.churnRate}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Peak Hours Line Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="text-lg font-bold mb-6">Peak Hour Utilization (Check-ins)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="people" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Top Trainers */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="text-lg font-bold mb-4">Top Rated Trainers</h3>
                        <div className="space-y-3">
                            {data.metrics.topTrainers.map((t, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <span className="font-bold text-gray-800">{t.first_name} {t.last_name}</span>
                                    <span className="text-yellow-500 font-bold">⭐ {t.rating}</span>
                                </div>
                            ))}
                            {data.metrics.topTrainers.length === 0 && <p className="text-sm text-gray-500">No reviews yet.</p>}
                        </div>
                    </div>

                    {/* Inventory Maintenance Alerts */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                        <h3 className="text-lg font-bold text-red-700 mb-4">🚨 Maintenance Alerts</h3>
                        <div className="space-y-3">
                            {data.alerts.map(eq => (
                                <div key={eq.id} className="p-3 bg-red-50 text-red-800 rounded border border-red-100 flex justify-between items-center">
                                    <span className="font-bold text-sm">{eq.name}</span>
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-red-200 px-2 py-1 rounded text-red-900">{eq.status.replace('_', ' ')}</span>
                                </div>
                            ))}
                            {data.alerts.length === 0 && <p className="text-sm text-green-600 font-bold">All equipment is operational.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}