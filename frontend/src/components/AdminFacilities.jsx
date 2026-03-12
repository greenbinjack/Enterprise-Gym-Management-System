import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function AdminFacilities() {
    const [rooms, setRooms] = useState([]);
    const [newRoom, setNewRoom] = useState({ name: '', totalCapacity: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

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

    const handleEditClick = (room) => {
        setEditingRoom({ ...room });
    };

    const handleSaveEdit = async () => {
        try {
            await api.put(`/api/admin/facilities/rooms/${editingRoom.id}`, { 
                name: editingRoom.name, 
                totalCapacity: editingRoom.totalCapacity 
            });
            setEditingRoom(null);
            fetchRooms();
        } catch (error) {
            alert("Failed to update room.");
        }
    };

    const handleDelete = async (roomId) => {
        if (!window.confirm("Are you sure you want to delete this facility?")) return;
        try {
            await api.delete(`/api/admin/facilities/rooms/${roomId}`);
            fetchRooms();
        } catch (error) {
            alert("Failed to delete room.");
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-cream mb-8">Facility Configuration</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Room Form */}
                <div className="bg-white dark:bg-darkCard p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 h-fit">
                    <h3 className="text-lg font-bold mb-4 dark:text-cream">Add New Studio / Room</h3>
                    <form onSubmit={handleAddRoom} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room Name</label>
                            <input type="text" value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-darkBg text-gray-900 dark:text-cream" required placeholder="e.g., Cycle Studio" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Physical Capacity</label>
                            <input type="number" value={newRoom.totalCapacity} onChange={e => setNewRoom({ ...newRoom, totalCapacity: e.target.value })} className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-darkBg text-gray-900 dark:text-cream" required min="1" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">
                            + Add Facility
                        </button>
                    </form>
                </div>

                {/* List of Rooms */}
                <div className="lg:col-span-2 bg-white dark:bg-darkCard rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-darkBg text-gray-600 dark:text-gray-400 text-sm uppercase">
                            <tr>
                                <th className="p-4 border-b dark:border-gray-700">Room / Studio Name</th>
                                <th className="p-4 border-b dark:border-gray-700">Capacity Limit</th>
                                <th className="p-4 border-b dark:border-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-darkBg transition-colors">
                                    {editingRoom?.id === room.id ? (
                                        <>
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    value={editingRoom.name} 
                                                    onChange={e => setEditingRoom({...editingRoom, name: e.target.value})}
                                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded box-border bg-white dark:bg-darkBg text-gray-900 dark:text-cream"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    value={editingRoom.totalCapacity} 
                                                    onChange={e => setEditingRoom({...editingRoom, totalCapacity: e.target.value})}
                                                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded box-border bg-white dark:bg-darkBg text-gray-900 dark:text-cream"
                                                />
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button onClick={handleSaveEdit} className="px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded hover:bg-green-200">Save</button>
                                                <button onClick={() => setEditingRoom(null)} className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Cancel</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-4 font-medium dark:text-cream">{room.name}</td>
                                            <td className="p-4 dark:text-gray-300">{room.totalCapacity} People</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleEditClick(room)} className="text-blue-600 hover:underline text-sm font-medium mr-4">Edit</button>
                                                <button onClick={() => handleDelete(room.id)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}