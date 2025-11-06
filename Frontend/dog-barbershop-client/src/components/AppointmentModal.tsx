import React from 'react';
import type { AppointmentDetail } from '../types';

interface AppointmentModalProps {
  appointment: AppointmentDetail | null;
  onClose: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ appointment, onClose }) => {
  if (!appointment) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Name</label>
              <p className="mt-1 text-sm text-gray-900">{appointment.firstName} ({appointment.username})</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Appointment Type</label>
              <p className="mt-1 text-sm text-gray-900">{appointment.appointmentTypeName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <p className="mt-1 text-sm text-gray-900">{appointment.durationMinutes} minutes</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(appointment.scheduledDate)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1 text-sm text-gray-900">{appointment.status}</p>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pricing</label>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Base Price:</span>
                  <span className="text-sm text-gray-900">₪{appointment.basePrice.toFixed(2)}</span>
                </div>
                {appointment.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">Discount:</span>
                    <span className="text-sm">-₪{appointment.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span className="text-sm text-gray-900">Final Price:</span>
                  <span className="text-sm text-gray-900">₪{appointment.finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700">Appointment Created At</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(appointment.createdAt)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">User Account Created At</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(appointment.userCreatedAt)}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

