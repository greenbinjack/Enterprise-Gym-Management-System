import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function AdminScheduleBuilder() {
    const [existingPlans, setExistingPlans] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [availableTrainers, setAvailableTrainers] = useState([]);
    const [status, setStatus] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // UI State
    const [step, setStep] = useState(1);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

    // Form State
    const [planData, setPlanData] = useState({
        name: '',
        description: '',
        category: 'CLASS_PACKAGE',
        monthlyPrice: '',
        discountLevel: 0,
        recurringDaysOfWeek: ['MONDAY'],
        recurringStartTime: '',
        durationMinutes: 60,
        allocatedRoomId: '',
        allocatedSeats: '',
        trainerIds: []
    });

    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user || user.role !== 'ADMIN') {
            navigate('/dashboard');
        } else {
            fetchPlans();
        }
    }, [navigate]);

    const fetchPlans = async () => {
        try {
            const plansRes = await api.get('/api/membership-plans');
            setExistingPlans(plansRes.data || []);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        }
    };

    const handleTrainerToggle = (trainerId) => {
        setPlanData(prev => {
            const currentIds = prev.trainerIds;
            if (currentIds.includes(trainerId)) {
                return { ...prev, trainerIds: currentIds.filter(id => id !== trainerId) };
            } else {
                return { ...prev, trainerIds: [...currentIds, trainerId] };
            }
        });
    };

    const handleCheckAvailability = async (e) => {
        e.preventDefault();
        setStatus({ type: '', text: '' });
        setIsCheckingAvailability(true);

        try {
            // Check availability for the next 52 weeks implicitly for recurring indefinitely
            const res = await api.post('/api/scheduling/admin/check-availability', {
                daysOfWeek: planData.recurringDaysOfWeek,
                time: planData.recurringStartTime,
                duration: planData.durationMinutes,
                weeks: 52
            });

            setAvailableRooms(res.data.rooms || []);
            setAvailableTrainers(res.data.trainers || []);
            setStep(2); // Move to allocation step
        } catch (error) {
            setStatus({ type: 'error', text: error.response?.data?.error || 'Failed to check availability.' });
        } finally {
            setIsCheckingAvailability(false);
        }
    };

    const handleSubmitPlan = async (e) => {
        e.preventDefault();

        if (!planData.allocatedRoomId) {
            setStatus({ type: 'error', text: 'You must allocate a room.' });
            return;
        }

        setStatus({ type: '', text: '' });
        setIsSubmitting(true);
        try {
            const res = await api.post('/api/membership-plans', planData);
            setStatus({ type: 'success', text: res.data.message || 'Membership Plan created successfully!' });

            // Reset form
            setPlanData({
                name: '',
                description: '',
                category: 'CLASS_PACKAGE',
                monthlyPrice: '',
                discountLevel: 0,
                recurringDaysOfWeek: ['MONDAY'],
                recurringStartTime: '',
                durationMinutes: 60,
                allocatedRoomId: '',
                allocatedSeats: '',
                trainerIds: []
            });
            setStep(1);
            fetchPlans();
        } catch (error) {
            setStatus({ type: 'error', text: error.response?.data?.error || 'Validation failed.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Membership Plan Creator</h2>
                <p className="text-gray-500 mt-1">Design new membership plans, define schedules, and allocate resources.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                {/* LEFT COLUMN: The Form */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-fit">
                    {status.type && (
                        <div className={`p-4 font-bold border-b ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {status.text}
                        </div>
                    )}

                    {/* Step indicator */}
                    <div className="flex border-b bg-gray-50">
                        <div className={`flex-1 p-4 text-center font-bold ${step === 1 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>
                            1. Define Plan
                        </div>
                        <div className={`flex-1 p-4 text-center font-bold ${step === 2 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>
                            2. Allocate Resources
                        </div>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleCheckAvailability} className="p-6 space-y-6">
                            <h3 className="text-lg font-bold border-b pb-2">Plan Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                                    <input type="text" value={planData.name} onChange={e => setPlanData({ ...planData, name: e.target.value })} className="w-full mt-1 p-2 border rounded" required placeholder="e.g. Premium Gold" />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea value={planData.description} onChange={e => setPlanData({ ...planData, description: e.target.value })} className="w-full mt-1 p-2 border rounded" required rows="3" placeholder="Describe the benefits of this plan..."></textarea>
                                </div>



                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Monthly Price ($)</label>
                                    <input type="number" step="0.01" value={planData.monthlyPrice} onChange={e => setPlanData({ ...planData, monthlyPrice: parseFloat(e.target.value) || '' })} className="w-full mt-1 p-2 border rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Yearly Discount (%)</label>
                                    <input type="number" value={planData.discountLevel} onChange={e => setPlanData({ ...planData, discountLevel: parseInt(e.target.value) || 0 })} className="w-full mt-1 p-2 border rounded" required min="0" max="100" />
                                </div>

                                <h3 className="text-lg font-bold border-b pb-2 col-span-2 mt-4">Recurring Class Schedule</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                                            <label key={day} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={planData.recurringDaysOfWeek.includes(day)}
                                                    onChange={(e) => {
                                                        const current = planData.recurringDaysOfWeek;
                                                        if (e.target.checked) setPlanData({ ...planData, recurringDaysOfWeek: [...current, day] });
                                                        else setPlanData({ ...planData, recurringDaysOfWeek: current.filter(d => d !== day) });
                                                    }}
                                                    className="rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="capitalize">{day.toLowerCase()}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {planData.recurringDaysOfWeek.length === 0 && <p className="text-red-500 text-xs mt-1">Please select at least one day.</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                    <input type="time" value={planData.recurringStartTime} onChange={e => setPlanData({ ...planData, recurringStartTime: e.target.value })} className="w-full mt-1 p-2 border rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
                                    <input type="number" value={planData.durationMinutes} onChange={e => setPlanData({ ...planData, durationMinutes: parseInt(e.target.value) || 60 })} className="w-full mt-1 p-2 border rounded" required min="15" />
                                </div>
                            </div>
                            <button type="submit" disabled={isCheckingAvailability || planData.recurringDaysOfWeek.length === 0} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors mt-6">
                                {isCheckingAvailability ? 'Checking Availability...' : 'Continue to Resource Allocation ➔'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmitPlan} className="p-6 space-y-6">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-bold">Resource Allocation</h3>
                                <button type="button" onClick={() => setStep(1)} className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
                                    ← Back
                                </button>
                            </div>

                            <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 p-4 rounded-lg text-sm mb-6">
                                <strong>Schedule:</strong> Recurs every {planData.recurringDaysOfWeek.map(d => d.charAt(0) + d.slice(1).toLowerCase()).join(', ')} at {planData.recurringStartTime} for {planData.durationMinutes} mins.
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Room</label>
                                    <select value={planData.allocatedRoomId} onChange={e => setPlanData({ ...planData, allocatedRoomId: e.target.value })} className="w-full p-2 border rounded" required>
                                        <option value="" disabled>Choose an available room...</option>
                                        {availableRooms.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.name} (Capacity: {r.remainingCapacity} available)
                                            </option>
                                        ))}
                                    </select>
                                    {availableRooms.length === 0 && <p className="text-red-500 text-xs mt-1">No rooms available for this time slot.</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Seats for Plan</label>
                                    <input type="number" value={planData.allocatedSeats} onChange={e => setPlanData({ ...planData, allocatedSeats: parseInt(e.target.value) || '' })} className="w-full p-2 border rounded" required min="1" placeholder="Max seats allowed for this plan" />
                                </div>

                                <div className="pt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign Trainers (Optional)</label>
                                    <div className="border rounded p-3 max-h-48 overflow-y-auto bg-gray-50 space-y-2">
                                        {availableTrainers.length > 0 ? (
                                            availableTrainers.map(t => (
                                                <div key={t.id} className="flex items-center space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        id={`trainer-${t.id}`}
                                                        checked={planData.trainerIds.includes(t.id)}
                                                        onChange={() => handleTrainerToggle(t.id)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor={`trainer-${t.id}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                                                        {t.firstName} {t.lastName}
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No trainers available for this time slot.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting || availableRooms.length === 0} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors mt-6">
                                {isSubmitting ? 'Finalizing Plan...' : '✓ Create Membership Plan'}
                            </button>
                        </form>
                    )}
                </div>

                {/* RIGHT COLUMN: The Plan List */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-fit max-h-[800px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Current Plans</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{existingPlans.length} Total</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        {existingPlans.length > 0 ? (
                            existingPlans.map(plan => {
                                // Calculate Yearly display price based on monthly + discount (for display purposes if Backend doesn't send it directly)
                                const monthly = parseFloat(plan.monthlyPrice) || 0;
                                const discount = plan.discountLevel || 0;
                                const yearlyRaw = (monthly * 12) * (1 - (discount / 100));
                                const yearlyFormatted = yearlyRaw.toFixed(2);

                                return (
                                    <div key={plan.id} className="border border-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                    {plan.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 font-medium tracking-wide uppercase mt-1">{plan.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-extrabold text-gray-900">${plan.monthlyPrice}<span className="text-xs text-gray-500 font-normal">/mo</span></p>
                                                <p className="text-xs text-gray-500">${yearlyFormatted}/yr <span className="text-green-600 font-bold ml-1">({discount}% OFF)</span></p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-4 bg-white p-3 rounded border border-gray-50 leading-relaxed">
                                            {plan.description || "No description provided."}
                                        </p>

                                        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3 space-y-1">
                                            <div className="flex items-center gap-2">
                                                🗓 <span className="font-semibold">Recurs {plan.recurringDayOfWeek ? plan.recurringDayOfWeek.split(',').map(d => d.charAt(0) + d.slice(1).toLowerCase()).join(', ') : 'TBD'} at {plan.recurringStartTime}</span> ({plan.durationMinutes} mins)
                                            </div>
                                            <div className="flex items-center gap-2 text-indigo-700">
                                                🪑 <span className="font-semibold">{plan.allocatedSeats}</span> Seats Allocated
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Assigned Trainers ({plan.trainers?.length || 0})</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {plan.trainers && plan.trainers.length > 0 ? (
                                                    plan.trainers.map(t => (
                                                        <span key={t.id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                            👤 {t.firstName} {t.lastName}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">None assigned</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                                <div className="text-gray-300 mb-3 text-5xl">📋</div>
                                <p className="text-gray-500 font-medium">No membership plans have been created yet.</p>
                                <p className="text-sm text-gray-400 mt-1">Use the form to create your first plan.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}