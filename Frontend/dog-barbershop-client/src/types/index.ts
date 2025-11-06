export interface User {
  id: number;
  username: string;
  firstName: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  firstName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
}

export interface AppointmentType {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface Appointment {
  id: number;
  userId: number;
  username: string;
  firstName: string;
  appointmentTypeId: number;
  appointmentTypeName: string;
  durationMinutes: number;
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  scheduledDate: string;
  status: string;
  createdAt: string;
}

export interface AppointmentDetail extends Appointment {
  userCreatedAt: string;
}

export interface CreateAppointmentRequest {
  appointmentTypeId: number;
  scheduledDate: string;
}

export interface UpdateAppointmentRequest {
  appointmentTypeId: number;
  scheduledDate: string;
}

