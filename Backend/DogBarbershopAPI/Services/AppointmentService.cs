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

        // Calculate discount BEFORE creating the appointment
        // This ensures we count only completed appointments that existed before this one
        var createdAt = DateTime.UtcNow;
        var basePrice = appointmentType.Price;
        var discountAmount = await CalculateDiscountAsync(userId, request.AppointmentTypeId, createdAt);
        var finalPrice = basePrice - discountAmount;

        var appointment = new Appointment
        {
            UserId = userId,
            AppointmentTypeId = request.AppointmentTypeId,
            ScheduledDate = request.ScheduledDate,
            Status = "Pending",
            CreatedAt = createdAt,
            BasePrice = basePrice,
            DiscountAmount = discountAmount,
            FinalPrice = finalPrice
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        
        // After saving, update CreatedAt to the actual database time if needed
        // This ensures consistency with the stored procedure calculation

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
            BasePrice = appointment.BasePrice,
            DiscountAmount = appointment.DiscountAmount,
            FinalPrice = appointment.FinalPrice,
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

        // Ensure AppointmentType is loaded
        if (appointment.AppointmentType == null)
        {
            await _context.Entry(appointment)
                .Reference(a => a.AppointmentType)
                .LoadAsync();
        }

        // Use stored prices instead of recalculating to prevent retroactive changes
        return new AppointmentResponse
        {
            Id = appointment.Id,
            UserId = appointment.UserId,
            Username = appointment.User?.Username ?? string.Empty,
            FirstName = appointment.User?.FirstName ?? string.Empty,
            AppointmentTypeId = appointment.AppointmentTypeId,
            AppointmentTypeName = appointment.AppointmentType?.Name ?? "לא זמין",
            DurationMinutes = appointment.AppointmentType?.DurationMinutes ?? 0,
            BasePrice = appointment.BasePrice,
            DiscountAmount = appointment.DiscountAmount,
            FinalPrice = appointment.FinalPrice,
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

        // Ensure AppointmentType is loaded
        if (appointment.AppointmentType == null)
        {
            await _context.Entry(appointment)
                .Reference(a => a.AppointmentType)
                .LoadAsync();
        }

        // Use stored prices instead of recalculating to prevent retroactive changes
        return new AppointmentDetailResponse
        {
            Id = appointment.Id,
            UserId = appointment.UserId,
            Username = appointment.User?.Username ?? string.Empty,
            FirstName = appointment.User?.FirstName ?? string.Empty,
            AppointmentTypeId = appointment.AppointmentTypeId,
            AppointmentTypeName = appointment.AppointmentType?.Name ?? "לא זמין",
            DurationMinutes = appointment.AppointmentType?.DurationMinutes ?? 0,
            BasePrice = appointment.BasePrice,
            DiscountAmount = appointment.DiscountAmount,
            FinalPrice = appointment.FinalPrice,
            ScheduledDate = appointment.ScheduledDate,
            Status = appointment.Status,
            CreatedAt = appointment.CreatedAt,
            UserCreatedAt = appointment.User?.CreatedAt ?? DateTime.UtcNow
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
            // Ensure AppointmentType is loaded
            if (appointment.AppointmentType == null)
            {
                await _context.Entry(appointment)
                    .Reference(a => a.AppointmentType)
                    .LoadAsync();
            }

            // Use stored prices instead of recalculating to prevent retroactive changes
            result.Add(new AppointmentResponse
            {
                Id = appointment.Id,
                UserId = appointment.UserId,
                Username = appointment.User?.Username ?? string.Empty,
                FirstName = appointment.User?.FirstName ?? string.Empty,
                AppointmentTypeId = appointment.AppointmentTypeId,
                AppointmentTypeName = appointment.AppointmentType?.Name ?? "לא זמין",
                DurationMinutes = appointment.AppointmentType?.DurationMinutes ?? 0,
                BasePrice = appointment.BasePrice,
                DiscountAmount = appointment.DiscountAmount,
                FinalPrice = appointment.FinalPrice,
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

        // Recalculate price when updating appointment (in case type changed)
        // Use the original CreatedAt to prevent retroactive discount changes
        var basePrice = appointmentType.Price;
        var discountAmount = await CalculateDiscountAsync(userId, request.AppointmentTypeId, appointment.CreatedAt);
        var finalPrice = basePrice - discountAmount;

        appointment.AppointmentTypeId = request.AppointmentTypeId;
        appointment.ScheduledDate = request.ScheduledDate;
        appointment.BasePrice = basePrice;
        appointment.DiscountAmount = discountAmount;
        appointment.FinalPrice = finalPrice;

        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return new AppointmentResponse
        {
            Id = appointment.Id,
            UserId = appointment.UserId,
            Username = user?.Username ?? appointment.User.Username,
            FirstName = user?.FirstName ?? appointment.User.FirstName,
            AppointmentTypeId = appointment.AppointmentTypeId,
            AppointmentTypeName = appointmentType.Name,
            DurationMinutes = appointmentType.DurationMinutes,
            BasePrice = appointment.BasePrice,
            DiscountAmount = appointment.DiscountAmount,
            FinalPrice = appointment.FinalPrice,
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

        return appointment != null && appointment.UserId == userId;
    }

    public async Task<AppointmentResponse?> UpdateAppointmentStatusAsync(int appointmentId, int userId, string status)
    {
        var appointment = await _context.Appointments
            .Include(a => a.User)
            .Include(a => a.AppointmentType)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment == null)
        {
            return null;
        }

        // Allow any authenticated user to update status (for marking appointments as completed)
        // Only the owner can cancel their own appointment
        if (status == "Cancelled" && appointment.UserId != userId)
        {
            return null;
        }

        if (status != "Pending" && status != "Completed" && status != "Cancelled")
        {
            return null;
        }

        appointment.Status = status;
        await _context.SaveChangesAsync();

        // Ensure AppointmentType is loaded
        if (appointment.AppointmentType == null)
        {
            await _context.Entry(appointment)
                .Reference(a => a.AppointmentType)
                .LoadAsync();
        }

        // Use stored prices instead of recalculating to prevent retroactive changes
        return new AppointmentResponse
        {
            Id = appointment.Id,
            UserId = appointment.UserId,
            Username = appointment.User?.Username ?? string.Empty,
            FirstName = appointment.User?.FirstName ?? string.Empty,
            AppointmentTypeId = appointment.AppointmentTypeId,
            AppointmentTypeName = appointment.AppointmentType?.Name ?? "לא זמין",
            DurationMinutes = appointment.AppointmentType?.DurationMinutes ?? 0,
            BasePrice = appointment.BasePrice,
            DiscountAmount = appointment.DiscountAmount,
            FinalPrice = appointment.FinalPrice,
            ScheduledDate = appointment.ScheduledDate,
            Status = appointment.Status,
            CreatedAt = appointment.CreatedAt
        };
    }

    private async Task<decimal> CalculateDiscountAsync(int userId, int appointmentTypeId, DateTime createdAt)
    {
        try
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
            command.Parameters.AddWithValue("@CreatedAt", createdAt);
            command.Parameters.Add("@BasePrice", System.Data.SqlDbType.Decimal).Direction = System.Data.ParameterDirection.Output;
            command.Parameters.Add("@DiscountAmount", System.Data.SqlDbType.Decimal).Direction = System.Data.ParameterDirection.Output;
            command.Parameters.Add("@FinalPrice", System.Data.SqlDbType.Decimal).Direction = System.Data.ParameterDirection.Output;

            await command.ExecuteNonQueryAsync();

            var discountAmount = (decimal)command.Parameters["@DiscountAmount"].Value;
            return discountAmount;
        }
        catch (SqlException ex)
        {
            // Log the error for debugging
            throw new InvalidOperationException($"Error calculating discount: {ex.Message}. Make sure the stored procedure sp_CalculateAppointmentPrice is updated in the database.", ex);
        }
    }
}

