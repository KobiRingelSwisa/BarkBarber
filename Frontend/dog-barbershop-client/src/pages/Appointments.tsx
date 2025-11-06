import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { AppointmentModal } from '../components/AppointmentModal';
import type { Appointment, AppointmentDetail, AppointmentType, CreateAppointmentRequest, UpdateAppointmentRequest } from '../types';

export const Appointments: React.FC = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCustomerName, setFilterCustomerName] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({ appointmentTypeId: 0, scheduledDate: '' });

  useEffect(() => {
    loadData();
  }, [filterDate, filterCustomerName]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, typesData] = await Promise.all([
        appointmentService.getAppointments(filterDate || undefined, filterCustomerName || undefined),
        appointmentService.getAppointmentTypes(),
      ]);
      setAppointments(appointmentsData);
      setAppointmentTypes(typesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentClick = async (id: number) => {
    try {
      const details = await appointmentService.getAppointmentDetails(id);
      setSelectedAppointment(details);
      setShowModal(true);
    } catch (err: any) {
      setError('Failed to load appointment details');
    }
  };

  const handleCreate = () => {
    setEditingAppointment(null);
    setFormData({ appointmentTypeId: appointmentTypes[0]?.id || 0, scheduledDate: '' });
    setShowForm(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      appointmentTypeId: appointment.appointmentTypeId,
      scheduledDate: appointment.scheduledDate.split('T')[0] + 'T' + appointment.scheduledDate.split('T')[1].substring(0, 5),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      await appointmentService.deleteAppointment(id);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete appointment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingAppointment) {
        const updateData: UpdateAppointmentRequest = {
          appointmentTypeId: formData.appointmentTypeId,
          scheduledDate: new Date(formData.scheduledDate).toISOString(),
        };
        await appointmentService.updateAppointment(editingAppointment.id, updateData);
      } else {
        const createData: CreateAppointmentRequest = {
          appointmentTypeId: formData.appointmentTypeId,
          scheduledDate: new Date(formData.scheduledDate).toISOString(),
        };
        await appointmentService.createAppointment(createData);
      }
      setShowForm(false);
      setEditingAppointment(null);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save appointment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dog Barbershop Appointments</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.firstName}!</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Appointment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Customer Name</label>
              <input
                type="text"
                value={filterCustomerName}
                onChange={(e) => setFilterCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {editingAppointment ? 'Edit Appointment' : 'Create Appointment'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Type
                    </label>
                    <select
                      value={formData.appointmentTypeId}
                      onChange={(e) => setFormData({ ...formData, appointmentTypeId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select type</option>
                      {appointmentTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} - {type.durationMinutes} min - ₪{type.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingAppointment(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      {editingAppointment ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Appointments List</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No appointments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAppointmentClick(appointment.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{appointment.firstName}</div>
                        <div className="text-sm text-gray-500">{appointment.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.appointmentTypeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(appointment.scheduledDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.discountAmount > 0 && (
                          <span className="text-green-600 line-through mr-2">
                            ₪{appointment.basePrice.toFixed(2)}
                          </span>
                        )}
                        <span>₪{appointment.finalPrice.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(appointment);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(appointment.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
};

