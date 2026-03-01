import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function AdminFacilities() {
    const [rooms, setRooms] = useState([]);
    const [newRoom, setNewRoom] = useState({ name: '', totalCapacity: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        const response = await api.get('/api/admin/facilities/rooms');
        setRooms(response.data);
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/api/admin/facilities/rooms', newRoom);
            setNewRoom({ name: '', totalCapacity: '' });
            fetchRooms(); // Refresh list
        } catch (error) {
            alert("Failed to add room.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Facility Configuration</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Room Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="text-lg font-bold mb-4">Add New Studio / Room</h3>
                    <form onSubmit={handleAddRoom} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Room Name</label>
                            <input type="text" value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} className="mt-1 w-full px-4 py-2 border rounded-lg" required placeholder="e.g., Cycle Studio" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Max Physical Capacity</label>
                            <input type="number" value={newRoom.totalCapacity} onChange={e => setNewRoom({ ...newRoom, totalCapacity: e.target.value })} className="mt-1 w-full px-4 py-2 border rounded-lg" required min="1" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">
                            + Add Facility
                        </button>
                    </form>
                </div>

                {/* List of Rooms */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                            <tr>
                                <th className="p-4 border-b">Room / Studio Name</th>
                                <th className="p-4 border-b">Capacity Limit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">{room.name}</td>
                                    <td className="p-4">{room.totalCapacity} People</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}