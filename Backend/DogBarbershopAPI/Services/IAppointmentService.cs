using DogBarbershopAPI.DTOs;

namespace DogBarbershopAPI.Services;

public interface IAppointmentService
{
    Task<AppointmentResponse?> CreateAppointmentAsync(int userId, CreateAppointmentRequest request);
    Task<AppointmentResponse?> GetAppointmentByIdAsync(int appointmentId, int userId);
    Task<AppointmentDetailResponse?> GetAppointmentDetailAsync(int appointmentId, int userId);
    Task<List<AppointmentResponse>> GetAppointmentsAsync(int? userId = null, DateTime? date = null, string? customerName = null);
    Task<AppointmentResponse?> UpdateAppointmentAsync(int appointmentId, int userId, UpdateAppointmentRequest request);
    Task<bool> DeleteAppointmentAsync(int appointmentId, int userId);
    Task<bool> CanUserModifyAppointmentAsync(int appointmentId, int userId);
    Task<bool> CanUserDeleteAppointmentAsync(int appointmentId, int userId);
}

