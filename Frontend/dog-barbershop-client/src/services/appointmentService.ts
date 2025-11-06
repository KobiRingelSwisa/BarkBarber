import api from './api';
import type {
  Appointment,
  AppointmentDetail,
  AppointmentType,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from '../types';

export const appointmentService = {
  async getAppointments(date?: string, customerName?: string): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (customerName) params.append('customerName', customerName);

    const response = await api.get<Appointment[]>(`/appointments?${params.toString()}`);
    return response.data;
  },

  async getAppointmentById(id: number): Promise<Appointment> {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  async getAppointmentDetails(id: number): Promise<AppointmentDetail> {
    const response = await api.get<AppointmentDetail>(`/appointments/${id}/details`);
    return response.data;
  },

  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },

  async updateAppointment(id: number, data: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await api.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  async deleteAppointment(id: number): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },

  async getAppointmentTypes(): Promise<AppointmentType[]> {
    const response = await api.get<AppointmentType[]>('/appointmenttypes');
    return response.data;
  },
};

