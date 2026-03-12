import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function TrainerShiftManager() {
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', text: '' });

    // Form state
    const [formData, setFormData] = useState({
        shiftName: '',
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '17:00'
    });

    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    useEffect(() => {
        fetchTrainers();
    }, []);

    const fetchTrainers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/users/trainers');
            setTrainers(res.data || []);
        } catch (err) {
            setStatus({ type: 'error', text: 'Failed to load trainers' });
        } finally {
            setLoading(false);
        }
    };

    const fetchTrainerShifts = async (trainerId) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/trainer-shifts/${trainerId}`);
            setShifts(res.data || []);
            setSelectedTrainer(trainerId);
            setStatus({ type: '', text: '' });
        } catch (err) {
            setStatus({ type: 'error', text: 'Failed to load shifts' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddShift = async (e) => {
        e.preventDefault();
        if (!selectedTrainer) {
            setStatus({ type: 'error', text: 'Please select a trainer' });
            return;
        }

        try {
            setLoading(true);
            await api.post(`/api/trainer-shifts/${selectedTrainer}`, formData);
            setStatus({ type: 'success', text: 'Shift created successfully' });
            setFormData({
                shiftName: '',
                dayOfWeek: 'MONDAY',
                startTime: '09:00',
                endTime: '17:00'
            });
            // Refresh shifts
            await fetchTrainerShifts(selectedTrainer);
        } catch (err) {
            setStatus({ 
                type: 'error', 
                text: err.response?.data?.error || 'Failed to create shift' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteShift = async (shiftId) => {
        if (!window.confirm('Are you sure you want to delete this shift?')) return;
        
        try {
            setLoading(true);
            await api.delete(`/api/trainer-shifts/${shiftId}`);
            setStatus({ type: 'success', text: 'Shift deleted successfully' });
            if (selectedTrainer) {
                await fetchTrainerShifts(selectedTrainer);
            }
        } catch (err) {
            setStatus({ type: 'error', text: 'Failed to delete shift' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-darkBg min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-cream">Trainer Shift Management</h1>

            {status.text && (
                <div className={`p-4 mb-6 rounded-lg ${
                    status.type === 'success' 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                    {status.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trainer Selection */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-darkCard rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-cream">Select Trainer</h2>
                        <div className="space-y-2">
                            {trainers.map(trainer => (
                                <button
                                    key={trainer.id}
                                    onClick={() => fetchTrainerShifts(trainer.id)}
                                    className={`w-full p-3 text-left rounded-lg transition ${
                                        selectedTrainer === trainer.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 dark:bg-darkBg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-cream'
                                    }`}
                                >
                                    <div className="font-medium">{trainer.firstName} {trainer.lastName}</div>
                                    <div className="text-sm opacity-75">{trainer.email}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form and Shifts */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedTrainer && (
                        <>
                            {/* Add New Shift Form */}
                            <div className="bg-white dark:bg-darkCard rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-cream">Add New Shift</h2>
                                <form onSubmit={handleAddShift} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Shift Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.shiftName}
                                            onChange={(e) => setFormData({...formData, shiftName: e.target.value})}
                                            placeholder="e.g., Morning Shift, Afternoon Shift"
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-darkBg text-gray-900 dark:text-cream"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Day of Week
                                        </label>
                                        <select
                                            value={formData.dayOfWeek}
                                            onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-darkBg text-gray-900 dark:text-cream"
                                        >
                                            {daysOfWeek.map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Start Time
                                            </label>
                                            <input
                                                type="time"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-darkBg text-gray-900 dark:text-cream"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                End Time
                                            </label>
                                            <input
                                                type="time"
                                                value={formData.endTime}
                                                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-darkBg text-gray-900 dark:text-cream"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
                                    >
                                        {loading ? 'Adding...' : 'Add Shift'}
                                    </button>
                                </form>
                            </div>

                            {/* Shifts List */}
                            <div className="bg-white dark:bg-darkCard rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-cream">Current Shifts</h2>
                                {shifts.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400">No shifts scheduled for this trainer</p>
                                ) : (
                                    <div className="space-y-3">
                                        {shifts.map(shift => (
                                            <div key={shift.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-darkBg rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-cream">{shift.shiftName}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {shift.dayOfWeek} • {shift.startTime} - {shift.endTime}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteShift(shift.id)}
                                                    disabled={loading}
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg text-sm transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
