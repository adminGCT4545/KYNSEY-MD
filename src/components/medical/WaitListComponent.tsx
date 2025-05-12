import React, { useState, useEffect } from 'react';
import { getWaitList, addToWaitList, removeFromWaitList } from '../../services/appointmentService';
import LoadingPlaceholder from '../common/LoadingPlaceholder';

interface WaitListComponentProps {
  selectedDate: string;
  locationId: number;
  onAssignAppointment?: (waitListId: number, patientId: number, patientName: string) => void;
}

/**
 * Component for displaying and managing the patient wait list
 */
const WaitListComponent: React.FC<WaitListComponentProps> = ({
  selectedDate,
  locationId,
  onAssignAppointment
}) => {
  const [waitList, setWaitList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPatient, setNewPatient] = useState({
    patientId: '',
    patientName: '',
    contactNumber: '',
    reason: '',
    urgency: 'normal',
    notes: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch wait list when date or location changes
  useEffect(() => {
    fetchWaitList();
  }, [selectedDate, locationId]);

  const fetchWaitList = async () => {
    try {
      setLoading(true);
      const data = await getWaitList();
      
      // Filter by location and date if provided
      const filteredData = data.filter((item: any) => {
        return (
          (!locationId || item.preferred_location_id === locationId) && 
          (!selectedDate || item.preferred_date === selectedDate)
        );
      });
      
      setWaitList(filteredData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load wait list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWaitList = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Create wait list entry data
      const waitListData = {
        patient_id: parseInt(newPatient.patientId),
        patient_name: newPatient.patientName,
        contact_number: newPatient.contactNumber,
        reason: newPatient.reason,
        urgency: newPatient.urgency,
        notes: newPatient.notes,
        preferred_date: selectedDate,
        preferred_location_id: locationId
      };
      
      await addToWaitList(waitListData);
      
      // Reset form
      setNewPatient({
        patientId: '',
        patientName: '',
        contactNumber: '',
        reason: '',
        urgency: 'normal',
        notes: ''
      });
      
      setShowAddForm(false);
      fetchWaitList();
    } catch (err: any) {
      setError(err.message || 'Failed to add to wait list');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWaitList = async (waitListId: number) => {
    if (window.confirm('Are you sure you want to remove this patient from the wait list?')) {
      try {
        setLoading(true);
        await removeFromWaitList(waitListId);
        fetchWaitList();
      } catch (err: any) {
        setError(err.message || 'Failed to remove from wait list');
      } finally {
        setLoading(false);
      }
    }
  };

  // Sort wait list by urgency and date added
  const sortedWaitList = [...waitList].sort((a, b) => {
    // Sort by urgency first
    const urgencyOrder = { high: 0, normal: 1, low: 2 };
    const urgencyDiff = urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder];
    
    if (urgencyDiff !== 0) {
      return urgencyDiff;
    }
    
    // Then sort by date added (oldest first)
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  
  // Get urgency badge color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="wait-list-component bg-white p-4 rounded shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Wait List</h3>
        <button 
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Patient'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddToWaitList} className="mb-4 bg-blue-50 p-3 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient ID
              </label>
              <input
                type="text"
                value={newPatient.patientId}
                onChange={(e) => setNewPatient({...newPatient, patientId: e.target.value})}
                className="w-full p-2 border rounded text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Name
              </label>
              <input
                type="text"
                value={newPatient.patientName}
                onChange={(e) => setNewPatient({...newPatient, patientName: e.target.value})}
                className="w-full p-2 border rounded text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="text"
                value={newPatient.contactNumber}
                onChange={(e) => setNewPatient({...newPatient, contactNumber: e.target.value})}
                className="w-full p-2 border rounded text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgency
              </label>
              <select
                value={newPatient.urgency}
                onChange={(e) => setNewPatient({...newPatient, urgency: e.target.value})}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <input
                type="text"
                value={newPatient.reason}
                onChange={(e) => setNewPatient({...newPatient, reason: e.target.value})}
                className="w-full p-2 border rounded text-sm"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={newPatient.notes}
                onChange={(e) => setNewPatient({...newPatient, notes: e.target.value})}
                className="w-full p-2 border rounded text-sm"
                rows={2}
              />
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
              disabled={loading}
            >
              Add to Wait List
            </button>
          </div>
        </form>
      )}

      <LoadingPlaceholder isLoading={loading} height="200px">
        {error ? (
          <div className="text-red-600 p-2">{error}</div>
        ) : sortedWaitList.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Patient</th>
                  <th className="text-left p-2">Reason</th>
                  <th className="text-left p-2">Urgency</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedWaitList.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="font-medium">{item.patient_name}</div>
                      <div className="text-xs text-gray-500">{item.contact_number}</div>
                    </td>
                    <td className="p-2">{item.reason}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(item.urgency)}`}>
                        {item.urgency}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onAssignAppointment && onAssignAppointment(
                            item.id, 
                            item.patient_id, 
                            item.patient_name
                          )}
                          className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => handleRemoveFromWaitList(item.id)}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No patients on the wait list.
          </div>
        )}
      </LoadingPlaceholder>
    </div>
  );
};

export default WaitListComponent;