import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { appointmentService } from '../services/appointmentService';
import type { AppointmentDetail } from '../types';

interface AppointmentModalProps {
  appointment: AppointmentDetail | null;
  onClose: () => void;
  onStatusChange?: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ appointment, onClose, onStatusChange }) => {
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

  const handleStatusChange = async (newStatus: string) => {
    try {
      await appointmentService.updateAppointmentStatus(appointment.id, newStatus);
      if (onStatusChange) {
        onStatusChange();
      }
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const canMarkAsCompleted = appointment.status === 'Pending' && new Date(appointment.scheduledDate) <= new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card 
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl bg-white"
        spotlightColor="rgba(251, 191, 36, 0.15)"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-amber-900">פרטי התור</h2>
            <button
              onClick={onClose}
              className="text-amber-600 hover:text-amber-800 text-3xl leading-none transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-amber-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">שם הלקוח</label>
                <p className="text-xl font-bold text-amber-900">{appointment.firstName}</p>
                <p className="text-sm text-amber-700 mt-1">@{appointment.username}</p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">סוג התור</label>
                <p className="text-xl font-bold text-amber-900">{appointment.appointmentTypeName || 'לא זמין'}</p>
                <p className="text-sm text-amber-700 mt-1">{appointment.durationMinutes} דקות</p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">סטטוס</label>
                <div className="mt-2">
                  <Badge variant="success">{appointment.status}</Badge>
                </div>
              </div>
            </div>

            <div className="border-t border-amber-200 pt-6">
              <h3 className="text-xl font-bold text-amber-900 mb-4">פרטי תמחור</h3>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-amber-800 font-medium">מחיר בסיס:</span>
                  <span className="font-bold text-amber-900 text-lg">₪{appointment.basePrice.toFixed(2)}</span>
                </div>
                {appointment.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-medium">הנחה (10%):</span>
                    <span className="font-bold text-lg">-₪{appointment.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t-2 border-amber-200">
                  <span className="text-xl font-bold text-amber-900">מחיר סופי:</span>
                  <span className="text-3xl font-bold text-amber-700">₪{appointment.finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-amber-200 pt-6">
              <h3 className="text-xl font-bold text-amber-900 mb-4">פרטי זמן</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-amber-50 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">זמן יצירת בקשת התור</label>
                  <p className="text-lg font-bold text-amber-900">{formatDate(appointment.createdAt)}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">תאריך ושעה מתוכננים</label>
                  <p className="text-lg font-bold text-amber-900">{formatDate(appointment.scheduledDate)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            {canMarkAsCompleted && (
              <Button
                onClick={() => handleStatusChange('Completed')}
                variant="primary"
                className="bg-green-600 text-white hover:bg-green-700 border-0"
              >
                סמן כהושלם
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="primary"
              className="bg-amber-100 text-amber-900 hover:bg-amber-200 border-0"
            >
              סגור
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
