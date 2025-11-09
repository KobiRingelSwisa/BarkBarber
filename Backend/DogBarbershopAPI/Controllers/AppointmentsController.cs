using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DogBarbershopAPI.DTOs;
using DogBarbershopAPI.Services;

namespace DogBarbershopAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentsController(IAppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet]
    public async Task<ActionResult<List<AppointmentResponse>>> GetAppointments(
        [FromQuery] DateTime? date,
        [FromQuery] string? customerName)
    {
        // Return all appointments (not filtered by user) - as per requirements
        // Passing null as userId to get all appointments regardless of user
        var appointments = await _appointmentService.GetAppointmentsAsync(null, date, customerName);
        return Ok(appointments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AppointmentResponse>> GetAppointment(int id)
    {
        var userId = GetCurrentUserId();
        var appointment = await _appointmentService.GetAppointmentByIdAsync(id, userId);

        if (appointment == null)
        {
            return NotFound("Appointment not found.");
        }

        return Ok(appointment);
    }

    [HttpGet("{id}/details")]
    public async Task<ActionResult<AppointmentDetailResponse>> GetAppointmentDetails(int id)
    {
        var userId = GetCurrentUserId();
        var appointment = await _appointmentService.GetAppointmentDetailAsync(id, userId);

        if (appointment == null)
        {
            return NotFound("Appointment not found.");
        }

        return Ok(appointment);
    }

    [HttpPost]
    public async Task<ActionResult<AppointmentResponse>> CreateAppointment([FromBody] CreateAppointmentRequest request)
    {
        if (request.AppointmentTypeId <= 0)
        {
            return BadRequest("Invalid appointment type.");
        }

        if (request.ScheduledDate < DateTime.UtcNow.Date)
        {
            return BadRequest("Scheduled date cannot be in the past.");
        }

        var userId = GetCurrentUserId();
        var appointment = await _appointmentService.CreateAppointmentAsync(userId, request);

        if (appointment == null)
        {
            return BadRequest("Failed to create appointment. Invalid appointment type or date.");
        }

        return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, appointment);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AppointmentResponse>> UpdateAppointment(int id, [FromBody] UpdateAppointmentRequest request)
    {
        var userId = GetCurrentUserId();

        var canModify = await _appointmentService.CanUserModifyAppointmentAsync(id, userId);
        if (!canModify)
        {
            return Forbid("You can only edit your own appointments.");
        }

        // Check if appointment is completed - cannot edit completed appointments
        var appointment = await _appointmentService.GetAppointmentByIdAsync(id, userId);
        if (appointment == null)
        {
            return NotFound("Appointment not found.");
        }

        if (appointment.Status == "Completed")
        {
            return BadRequest(new { message = "לא ניתן לערוך תורים שהושלמו." });
        }

        if (request.AppointmentTypeId <= 0)
        {
            return BadRequest("Invalid appointment type.");
        }

        if (request.ScheduledDate < DateTime.UtcNow.Date)
        {
            return BadRequest("Scheduled date cannot be in the past.");
        }

        var updatedAppointment = await _appointmentService.UpdateAppointmentAsync(id, userId, request);

        if (updatedAppointment == null)
        {
            return NotFound("Appointment not found or invalid data.");
        }

        return Ok(updatedAppointment);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAppointment(int id)
    {
        var userId = GetCurrentUserId();

        var appointment = await _appointmentService.GetAppointmentByIdAsync(id, userId);
        if (appointment == null)
        {
            return NotFound(new { message = "התור לא נמצא." });
        }

        // Check if user owns the appointment
        if (appointment.UserId != userId)
        {
            return BadRequest(new { message = "ניתן למחוק רק את התורים שלך." });
        }

        // Check if appointment is scheduled for today - cannot delete same-day appointments
        var today = DateTime.UtcNow.Date;
        var appointmentDate = appointment.ScheduledDate.Date;
        if (appointmentDate == today)
        {
            return BadRequest(new { message = "לא ניתן למחוק תורים באותו היום." });
        }

        var deleted = await _appointmentService.DeleteAppointmentAsync(id, userId);

        if (!deleted)
        {
            return BadRequest(new { message = "מחיקת התור נכשלה." });
        }

        return NoContent();
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<AppointmentResponse>> UpdateAppointmentStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(request.Status))
        {
            return BadRequest("Status is required.");
        }

        var appointment = await _appointmentService.UpdateAppointmentStatusAsync(id, userId, request.Status);

        if (appointment == null)
        {
            return NotFound("Appointment not found or you don't have permission to update it.");
        }

        return Ok(appointment);
    }
}

