using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using DogBarbershopAPI.Data;
using DogBarbershopAPI.DTOs;
using DogBarbershopAPI.Models;

namespace DogBarbershopAPI.Services;

public class AppointmentService : IAppointmentService
{
    private readonly DogBarbershopDbContext _context;
    private readonly IConfiguration _configuration;

    public AppointmentService(DogBarbershopDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AppointmentResponse?> CreateAppointmentAsync(int userId, CreateAppointmentRequest request)
    {
        var appointmentType = await _context.AppointmentTypes
            .FirstOrDefaultAsync(at => at.Id == request.AppointmentTypeId);

        if (appointmentType == null)
        {
            return null;
        }

        if (request.ScheduledDate < DateTime.UtcNow.Date)
        {
            return null;
        }

        var basePrice = appointmentType.Price;
        var discountAmount = await CalculateDiscountAsync(userId, request.AppointmentTypeId);
        var finalPrice = basePrice - discountAmount;

        var appointment = new Appointment
        {
            UserId = userId,
            AppointmentTypeId = request.AppointmentTypeId,
            ScheduledDate = request.ScheduledDate,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return new AppointmentResponse
        {
            Id = appointment.Id,
            UserId = appointment.UserId,
            Username = user?.Username ?? string.Empty,
            FirstName = user?.FirstName ?? string.Empty,
            AppointmentTypeId = appointment.AppointmentTypeId,
            AppointmentTypeName = appointmentType.Name,
            DurationMinutes = appointmentType.DurationMinutes,
            BasePrice = basePrice,
            DiscountAmount = discountAmount,
            FinalPrice = finalPrice,
            ScheduledDate = appointment.ScheduledDate,
            Status = appointment.Status,
            CreatedAt = appointment.CreatedAt
        };
    }

    public async Task<AppointmentResponse?> GetAppointmentByIdAsync(int appointmentId, int userId)
    {
        var appointment = await _context.Appointments
            .Include(a => a.User)
            .Include(a => a.AppointmentType)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment == null)
        {
            return null;
        }

        var basePrice = appointment.AppointmentType.Price;
        var discountAmount = await CalculateDiscountAsync(userId, appointment.AppointmentTypeId);
        var finalPrice = basePrice - discountAmount;

        return new AppointmentResponse
        {
            Id = appointment.Id,
            UserId = appointment.UserId,
            Username = appointment.User.Username,
            FirstName = appointment.User.FirstName,
            AppointmentTypeId = appointment.AppointmentTypeId,
            AppointmentTypeName = appointment.AppointmentType.Name,
            DurationMinutes = appointment.AppointmentType.DurationMinutes,
            BasePrice = basePrice,
            DiscountAmount = discountAmount,
            FinalPrice = finalPrice,
            ScheduledDate = appointment.ScheduledDate,
            Status = appointment.Status,
            CreatedAt = appointment.CreatedAt
        };
    }

    public async Task<AppointmentDetailResponse?> GetAppointmentDetailAsync(int appointmentId, int userId)
    {
        var appointment = await _context.Appointments
            .Include(a => a.User)
            .Include(a => a.AppointmentType)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment == null)
        {
            return null;
        }

        var basePrice = appointment.AppointmentType.Price;
        var discountAmount = await CalculateDiscountAsync(userId, appointment.AppointmentTypeId);
        var finalPrice = basePrice - discountAmount;

        return new AppointmentDetailResponse
        {
            Id = appointment.Id,
            UserId = appointment.UserId,
            Username = appointment.User.Username,
            FirstName = appointment.User.FirstName,
            AppointmentTypeId = appointment.AppointmentTypeId,
            AppointmentTypeName = appointment.AppointmentType.Name,
            DurationMinutes = appointment.AppointmentType.DurationMinutes,
            BasePrice = basePrice,
            DiscountAmount = discountAmount,
            FinalPrice = finalPrice,
            ScheduledDate = appointment.ScheduledDate,
            Status = appointment.Status,
            CreatedAt = appointment.CreatedAt,
            UserCreatedAt = appointment.User.CreatedAt
        };
    }

    public async Task<List<AppointmentResponse>> GetAppointmentsAsync(int? userId = null, DateTime? date = null, string? customerName = null)
    {
        var query = _context.Appointments
            .Include(a => a.User)
            .Include(a => a.AppointmentType)
            .AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(a => a.UserId == userId.Value);
        }

        if (date.HasValue)
        {
            var dateOnly = date.Value.Date;
            query = query.Where(a => a.ScheduledDate.Date == dateOnly);
        }

        if (!string.IsNullOrWhiteSpace(customerName))
        {
            query = query.Where(a => a.User.FirstName.Contains(customerName) || a.User.Username.Contains(customerName));
        }

        var appointments = await query
            .OrderBy(a => a.ScheduledDate)
            .ToListAsync();

        var result = new List<AppointmentResponse>();

        foreach (var appointment in appointments)
        {
            var basePrice = appointment.AppointmentType.Price;
            var discountAmount = await CalculateDiscountAsync(appointment.UserId, appointment.AppointmentTypeId);
            var finalPrice = basePrice - discountAmount;

            result.Add(new AppointmentResponse
            {
                Id = appointment.Id,
                UserId = appointment.UserId,
                Username = appointment.User.Username,
                FirstName = appointment.User.FirstName,
                AppointmentTypeId = appointment.AppointmentTypeId,
                AppointmentTypeName = appointment.AppointmentType.Name,
                DurationMinutes = appointment.AppointmentType.DurationMinutes,
                BasePrice = basePrice,
                DiscountAmount = discountAmount,
                FinalPrice = finalPrice,
                ScheduledDate = appointment.ScheduledDate,
                Status = appointment.Status,
                CreatedAt = appointment.CreatedAt
            });
        }

        return result;
    }

    public async Task<AppointmentResponse?> UpdateAppointmentAsync(int appointmentId, int userId, UpdateAppointmentRequest request)
    {
        var appointment = await _context.Appointments
            .Include(a => a.User)
            .Include(a => a.AppointmentType)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment == null)
        {
            return null;
        }

        if (appointment.UserId != userId)
        {
            return null;
        }

        var appointmentType = await _context.AppointmentTypes
            .FirstOrDefaultAsync(at => at.Id == request.AppointmentTypeId);

        if (appointmentType == null)
        {
            return null;
        }

        if (request.ScheduledDate < DateTime.UtcNow.Date)
        {
            return null;
        }

        appointment.AppointmentTypeId = request.AppointmentTypeId;
        appointment.ScheduledDate = request.ScheduledDate;

        await _context.SaveChangesAsync();

        var basePrice = appointmentType.Price;
        var discountAmount = await CalculateDiscountAsync(userId, request.AppointmentTypeId);
        var finalPrice = basePrice - discountAmount;

        return new AppointmentResponse
        {
            Id = appointment.Id,
            UserId = appointment.UserId,
            Username = appointment.User.Username,
            FirstName = appointment.User.FirstName,
            AppointmentTypeId = appointment.AppointmentTypeId,
            AppointmentTypeName = appointmentType.Name,
            DurationMinutes = appointmentType.DurationMinutes,
            BasePrice = basePrice,
            DiscountAmount = discountAmount,
            FinalPrice = finalPrice,
            ScheduledDate = appointment.ScheduledDate,
            Status = appointment.Status,
            CreatedAt = appointment.CreatedAt
        };
    }

    public async Task<bool> DeleteAppointmentAsync(int appointmentId, int userId)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment == null)
        {
            return false;
        }

        if (appointment.UserId != userId)
        {
            return false;
        }

        var today = DateTime.UtcNow.Date;
        if (appointment.ScheduledDate.Date == today)
        {
            return false;
        }

        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> CanUserModifyAppointmentAsync(int appointmentId, int userId)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        return appointment != null && appointment.UserId == userId;
    }

    public async Task<bool> CanUserDeleteAppointmentAsync(int appointmentId, int userId)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment == null || appointment.UserId != userId)
        {
            return false;
        }

        var today = DateTime.UtcNow.Date;
        return appointment.ScheduledDate.Date != today;
    }

    private async Task<decimal> CalculateDiscountAsync(int userId, int appointmentTypeId)
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");

        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        using var command = new SqlCommand("sp_CalculateAppointmentPrice", connection)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };

        command.Parameters.AddWithValue("@UserId", userId);
        command.Parameters.AddWithValue("@AppointmentTypeId", appointmentTypeId);
        command.Parameters.Add("@BasePrice", System.Data.SqlDbType.Decimal).Direction = System.Data.ParameterDirection.Output;
        command.Parameters.Add("@DiscountAmount", System.Data.SqlDbType.Decimal).Direction = System.Data.ParameterDirection.Output;
        command.Parameters.Add("@FinalPrice", System.Data.SqlDbType.Decimal).Direction = System.Data.ParameterDirection.Output;

        await command.ExecuteNonQueryAsync();

        var discountAmount = (decimal)command.Parameters["@DiscountAmount"].Value;
        return discountAmount;
    }
}

