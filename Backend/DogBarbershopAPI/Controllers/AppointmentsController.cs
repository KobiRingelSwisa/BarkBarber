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
        var userId = GetCurrentUserId();
        var appointments = await _appointmentService.GetAppointmentsAsync(userId, date, customerName);
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

        if (request.AppointmentTypeId <= 0)
        {
            return BadRequest("Invalid appointment type.");
        }

        if (request.ScheduledDate < DateTime.UtcNow.Date)
        {
            return BadRequest("Scheduled date cannot be in the past.");
        }

        var appointment = await _appointmentService.UpdateAppointmentAsync(id, userId, request);

        if (appointment == null)
        {
            return NotFound("Appointment not found or invalid data.");
        }

        return Ok(appointment);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAppointment(int id)
    {
        var userId = GetCurrentUserId();

        var canDelete = await _appointmentService.CanUserDeleteAppointmentAsync(id, userId);
        if (!canDelete)
        {
            return BadRequest("You can only delete your own appointments, and not appointments scheduled for today.");
        }

        var deleted = await _appointmentService.DeleteAppointmentAsync(id, userId);

        if (!deleted)
        {
            return NotFound("Appointment not found.");
        }

        return NoContent();
    }
}

