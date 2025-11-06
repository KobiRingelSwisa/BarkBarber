import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { AppointmentModal } from '../components/AppointmentModal';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
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
      setError(err.response?.data?.message || 'טעינת התורים נכשלה');
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
      setError('טעינת פרטי התור נכשלה');
    }
  };

  const handleCreate = () => {
    setEditingAppointment(null);
    setFormData({ appointmentTypeId: appointmentTypes[0]?.id || 0, scheduledDate: '' });
    setShowForm(true);
  };

  const formatDateForInput = (isoDateString: string): string => {
    // Convert ISO date string (UTC) to datetime-local format (YYYY-MM-DDTHH:mm)
    // We extract UTC components to match what we send (treating as UTC, not local)
    const date = new Date(isoDateString);
    
    // Get UTC date components (not local) to preserve the exact time values
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      appointmentTypeId: appointment.appointmentTypeId,
      scheduledDate: formatDateForInput(appointment.scheduledDate),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את התור הזה?')) {
      return;
    }

    try {
      await appointmentService.deleteAppointment(id);
      await loadData();
      setError(''); // Clear any previous errors
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'מחיקת התור נכשלה';
      setError(errorMessage);
      console.error('Delete appointment error:', err.response?.data || err);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await appointmentService.updateAppointmentStatus(id, newStatus);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'שינוי הסטטוס נכשל');
    }
  };

  const convertLocalDateTimeToISO = (localDateTime: string): string => {
    // datetime-local input returns format: YYYY-MM-DDTHH:mm
    // We want to preserve the exact time values the user selected (treat as UTC)
    // This means if user selects 00:44, we send 00:44 UTC (not converted to local time)
    if (!localDateTime) return '';
    
    // Parse the datetime string
    const [datePart, timePart] = localDateTime.split('T');
    if (!datePart || !timePart) {
      throw new Error('Invalid date format');
    }
    
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    // Create a UTC date directly with the values the user selected
    // This preserves the exact time values without timezone conversion
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    
    // Check if date is valid
    if (isNaN(utcDate.getTime())) {
      throw new Error('Invalid date');
    }
    
    return utcDate.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const isoDate = convertLocalDateTimeToISO(formData.scheduledDate);
      
      if (editingAppointment) {
        const updateData: UpdateAppointmentRequest = {
          appointmentTypeId: formData.appointmentTypeId,
          scheduledDate: isoDate,
        };
        await appointmentService.updateAppointment(editingAppointment.id, updateData);
      } else {
        const createData: CreateAppointmentRequest = {
          appointmentTypeId: formData.appointmentTypeId,
          scheduledDate: isoDate,
        };
        await appointmentService.createAppointment(createData);
      }
      setShowForm(false);
      setEditingAppointment(null);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'שמירת התור נכשלה');
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
      <Header showAuth={true} userName={user?.firstName} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-amber-900 mb-2">רשימת לקוחות הממתינים</h1>
            <p className="text-lg text-amber-800">צפה בכל התורים וקבע תור חדש לתספורת הכלב שלך</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={handleCreate}
              variant="primary"
              size="lg"
              className="bg-amber-100 text-amber-900 hover:bg-amber-200 border-0 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              תור חדש
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 p-6 shadow-xl bg-white">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-4">סינון תורים</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="סנן לפי תאריך"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
                <Input
                  label="סנן לפי שם לקוח"
                  type="text"
                  placeholder="הכנס שם לקוח"
                  value={filterCustomerName}
                  onChange={(e) => setFilterCustomerName(e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-amber-200 pt-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-4">רשימת תורים</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="mx-auto h-16 w-16 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-semibold text-amber-900">לא נמצאו תורים</h3>
                  <p className="mt-2 text-sm text-amber-700">התחל על ידי יצירת תור חדש.</p>
                  <div className="mt-6">
                    <Button 
                      onClick={handleCreate} 
                      variant="primary"
                      className="bg-amber-100 text-amber-900 hover:bg-amber-200 border-0"
                    >
                      צור את התור הראשון שלך
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      hover={true}
                      className="p-6 cursor-pointer border-l-4 border-amber-500 shadow-md hover:shadow-xl transition-all duration-200 bg-white"
                      onClick={() => handleAppointmentClick(appointment.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                              <span className="text-amber-900 font-bold text-lg">
                                {appointment.firstName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-amber-900">{appointment.firstName}</h3>
                              <p className="text-sm text-amber-700">@{appointment.username}</p>
                            </div>
                            <div className="ml-auto flex items-center space-x-2">
                              <Badge variant="success">{appointment.status}</Badge>
                              {appointment.status === 'Pending' && new Date(appointment.scheduledDate) <= new Date() && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(appointment.id, 'Completed');
                                  }}
                                  className="bg-green-600 text-white hover:bg-green-700 border-0 text-xs"
                                >
                                  סמן כהושלם
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="bg-amber-50 rounded-lg p-3">
                              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">סוג</span>
                              <p className="font-bold text-amber-900 mt-1">
                                {appointment.appointmentTypeName || 'לא זמין'}
                              </p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">תאריך ושעה</span>
                              <p className="font-bold text-amber-900 mt-1">{formatDate(appointment.scheduledDate)}</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">מחיר</span>
                              <p className="font-bold text-amber-900 mt-1">
                                {appointment.discountAmount > 0 && (
                                  <span className="text-green-600 line-through mr-2 text-sm">
                                    ₪{appointment.basePrice.toFixed(2)}
                                  </span>
                                )}
                                <span className="text-amber-700">₪{appointment.finalPrice.toFixed(2)}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        {user && appointment.userId === user.id && (
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(appointment);
                              }}
                              className="border-amber-300 text-amber-900 hover:bg-amber-50"
                            >
                              ערוך
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(appointment.id);
                              }}
                            >
                              מחק
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-4">למה לבחור בנו?</h3>
              <ul className="space-y-4 text-amber-100">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">שירותי תספורת מקצועיים</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">הנחות נאמנות ללקוחות קבועים</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">קביעת תורים קלה באינטרנט</span>
                </li>
              </ul>
            </Card>

            {appointmentTypes.length > 0 && (
              <Card className="p-6 shadow-xl bg-white">
                <h3 className="text-xl font-bold text-amber-900 mb-4">סוגי שירותים</h3>
                <div className="space-y-3">
                  {appointmentTypes.map((type) => (
                    <div key={type.id} className="border-l-4 border-amber-500 pl-4 py-3 bg-amber-50 rounded-r-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-amber-900">{type.name}</p>
                          <p className="text-sm text-amber-700 mt-1">{type.durationMinutes} דקות</p>
                        </div>
                        <p className="font-bold text-amber-700 text-lg">₪{type.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-8 shadow-2xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-amber-900">
                {editingAppointment ? 'ערוך תור' : 'תור חדש'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAppointment(null);
                }}
                className="text-amber-600 hover:text-amber-800 text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  סוג תור
                </label>
                <select
                  value={formData.appointmentTypeId}
                  onChange={(e) => setFormData({ ...formData, appointmentTypeId: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all text-amber-900 bg-white"
                  required
                >
                  <option value="">בחר סוג</option>
                  {appointmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {type.durationMinutes} דק' - ₪{type.price}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="תאריך ושעה מתוכננים"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
              />
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAppointment(null);
                  }}
                  className="border-amber-300 text-amber-900 hover:bg-amber-50"
                >
                  ביטול
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  className="bg-amber-100 text-amber-900 hover:bg-amber-200 border-0"
                >
                  {editingAppointment ? 'עדכן' : 'צור'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showModal && selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowModal(false);
            setSelectedAppointment(null);
          }}
          onStatusChange={loadData}
        />
      )}
    </div>
  );
};
