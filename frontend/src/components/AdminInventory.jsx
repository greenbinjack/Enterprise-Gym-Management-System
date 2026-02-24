import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminInventory() {
    const [equipment, setEquipment] = useState([]);

    useEffect(() => { fetchInventory(); }, []);

    const fetchInventory = async () => {
        const response = await axios.get('http://localhost:8080/api/admin/equipment');
        setEquipment(response.data);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Master Equipment Inventory</h2>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                        <tr><th className="p-4">Machine Name</th><th className="p-4">Category</th><th className="p-4">Status</th><th className="p-4">Database ID</th></tr>
                    </thead>
                    <tbody>
                        {equipment.map(item => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold">{item.name}</td>
                                <td className="p-4 text-gray-600">{item.category}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded ${item.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="p-4 text-xs font-mono text-gray-400">{item.id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}