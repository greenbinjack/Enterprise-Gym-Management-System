import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminScheduleBuilder() {
    const [step, setStep] = useState(1);
    const [existingClasses, setExistingClasses] = useState([]);
    const [status, setStatus] = useState({ type: '', text: '' });

    // Form States
    const [timeData, setTimeData] = useState({ name: '', dayOfWeek: 'MONDAY', time: '18:00', duration: 60, weeks: 4 });
    const [availableData, setAvailableData] = useState({ rooms: [], trainers: [] });
    const [resourceData, setResourceData] = useState({ roomId: '', trainerId: '', classSeats: '' });

    // Calendar States
    const today = new Date();
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    useEffect(() => { fetchExistingClasses(); }, []);

    const fetchExistingClasses = async () => {
        const res = await axios.get('http://localhost:8080/api/scheduling/classes');
        setExistingClasses(res.data);
    };

    // --- FORM LOGIC ---
    const handleCheckAvailability = async (e) => {
        e.preventDefault();
        setStatus({ type: '', text: '' });
        try {
            const res = await axios.post('http://localhost:8080/api/scheduling/admin/check-availability', timeData);
            setAvailableData(res.data);
            if (res.data.rooms.length === 0 || res.data.trainers.length === 0) {
                setStatus({ type: 'error', text: 'No rooms or trainers are available for this entire time block.' });
                return;
            }
            setResourceData({ roomId: res.data.rooms[0].id, trainerId: res.data.trainers[0].id, classSeats: 1 });
            setStep(2);
        } catch (error) { setStatus({ type: 'error', text: 'Failed to calculate availability.' }); }
    };

    const handleSubmitBundle = async (e) => {
        e.preventDefault();
        const selectedRoom = availableData.rooms.find(r => r.id === resourceData.roomId);
        if (resourceData.classSeats > selectedRoom.remainingCapacity) {
            setStatus({ type: 'error', text: `You requested ${resourceData.classSeats} seats, but only ${selectedRoom.remainingCapacity} are available.` });
            return;
        }
        try {
            const res = await axios.post('http://localhost:8080/api/scheduling/admin/bundle', { ...timeData, ...resourceData });
            setStatus({ type: 'success', text: res.data.message });
            setStep(1);
            setTimeData({ name: '', dayOfWeek: 'MONDAY', time: '18:00', duration: 60, weeks: 4 });
            fetchExistingClasses();
        } catch (error) { setStatus({ type: 'error', text: error.response?.data?.error || 'Validation failed.' }); }
    };

    // --- CALENDAR LOGIC ---
    const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
    const firstDayIndex = currentMonthDate.getDay(); // 0 = Sun, 1 = Mon...

    const prevMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));

    // Group classes by Date string (YYYY-MM-DD) for instant calendar lookups
    // Group classes using strict LOCAL time to avoid UTC timezone shifts!
    const classesByDate = existingClasses.reduce((acc, cls) => {
        const d = new Date(cls.startTime);
        // Force Javascript to use your local browser timezone for the YYYY-MM-DD string
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(cls);
        return acc;
    }, {});

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const calendarHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Master Schedule Builder</h2>
                <p className="text-gray-500 mt-1">Create class bundles and monitor facility capacity in real-time.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">

                {/* LEFT COLUMN: The Schedule Form */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-fit">
                    {status.type && (
                        <div className={`p-4 font-bold border-b ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {status.text}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleCheckAvailability} className="p-6 space-y-6">
                            <h3 className="text-lg font-bold border-b pb-2">Step 1: Define Schedule</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700">Class Name</label><input type="text" value={timeData.name} onChange={e => setTimeData({ ...timeData, name: e.target.value })} className="w-full mt-1 p-2 border rounded" required /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Day</label><select value={timeData.dayOfWeek} onChange={e => setTimeData({ ...timeData, dayOfWeek: e.target.value })} className="w-full mt-1 p-2 border rounded">{days.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-gray-700">Time</label><input type="time" value={timeData.time} onChange={e => setTimeData({ ...timeData, time: e.target.value })} className="w-full mt-1 p-2 border rounded" required /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Duration (Min)</label><input type="number" value={timeData.duration} onChange={e => setTimeData({ ...timeData, duration: parseInt(e.target.value) })} className="w-full mt-1 p-2 border rounded" required /></div>
                                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Repeat (Weeks)</label><input type="number" value={timeData.weeks} onChange={e => setTimeData({ ...timeData, weeks: parseInt(e.target.value) })} min="1" max="52" className="w-full mt-1 p-2 border rounded" required /></div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Check Database Availability ➔</button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmitBundle} className="p-6 space-y-6">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-bold">Step 2: Assign Resources</h3>
                                <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-800">⬅ Back</button>
                            </div>
                            <div className="space-y-4">
                                <div><label className="block text-sm font-medium text-gray-700">Available Rooms</label><select value={resourceData.roomId} onChange={e => setResourceData({ ...resourceData, roomId: e.target.value })} className="w-full mt-1 p-2 border rounded">{availableData.rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.remainingCapacity} seats left)</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-gray-700">Available Trainers</label><select value={resourceData.trainerId} onChange={e => setResourceData({ ...resourceData, trainerId: e.target.value })} className="w-full mt-1 p-2 border rounded">{availableData.trainers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-gray-700">Requested Seats</label><input type="number" value={resourceData.classSeats} onChange={e => setResourceData({ ...resourceData, classSeats: parseInt(e.target.value) })} min="1" className="w-full mt-1 p-2 border rounded bg-yellow-50" required /></div>
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">Confirm & Generate Bundle</button>
                        </form>
                    )}
                </div>

                {/* RIGHT COLUMN: The Interactive Calendar */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-fit flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex space-x-2">
                            <button onClick={prevMonth} className="p-2 rounded bg-gray-100 hover:bg-gray-200">⬅</button>
                            <button onClick={nextMonth} className="p-2 rounded bg-gray-100 hover:bg-gray-200">➡</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                        {calendarHeaders.map(day => <div key={day} className="text-xs font-bold text-gray-400 uppercase tracking-wider">{day}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-2 flex-1">
                        {/* Empty padding for the first day of the month */}
                        {[...Array(firstDayIndex)].map((_, i) => <div key={`empty-${i}`} className="p-2"></div>)}

                        {/* Actual Days */}
                        {[...Array(daysInMonth)].map((_, i) => {
                            const dayNum = i + 1;
                            // Format current calendar cell to YYYY-MM-DD to check against our grouped classes
                            const cellDateStr = `${currentMonthDate.getFullYear()}-${String(currentMonthDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                            const classesOnThisDay = classesByDate[cellDateStr] || [];

                            return (
                                <div key={dayNum} className="relative group flex flex-col items-center justify-center p-2 h-14 rounded-lg border border-transparent hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors">
                                    <span className={`text-sm font-medium ${classesOnThisDay.length > 0 ? 'text-blue-900 font-bold' : 'text-gray-600'}`}>{dayNum}</span>

                                    {/* Indicator Dots */}
                                    <div className="flex space-x-1 mt-1">
                                        {classesOnThisDay.slice(0, 3).map((_, idx) => (
                                            <div key={idx} className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        ))}
                                        {classesOnThisDay.length > 3 && <span className="text-[8px] leading-none text-blue-500 font-bold">+</span>}
                                    </div>

                                    {/* THE HOVER TOOLTIP */}
                                    {classesOnThisDay.length > 0 && (
                                        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-4 bg-gray-900 text-white text-left rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <p className="font-bold text-blue-300 border-b border-gray-700 pb-2 mb-2 text-sm">{new Date(cellDateStr).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                                {classesOnThisDay.map(cls => {
                                                    const start = new Date(cls.startTime);
                                                    const end = new Date(cls.endTime);
                                                    const duration = (end - start) / 60000;
                                                    return (
                                                        <div key={cls.id} className="bg-gray-800 p-2 rounded border border-gray-700">
                                                            <p className="font-bold text-xs">{cls.name}</p>
                                                            <p className="text-[10px] text-gray-400 mt-1">🕒 {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({duration} mins)</p>
                                                            <p className="text-[10px] text-gray-400">👤 {cls.trainer.firstName} {cls.trainer.lastName}</p>
                                                            <p className="text-[10px] text-gray-400">📍 {cls.room.name}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Existing Classes List (Optional now, but good for table view!) */}
            {/* ... keeping your existing table down here ... */}
        </div>
    );
}