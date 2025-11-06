using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DogBarbershopAPI.Data;
using DogBarbershopAPI.DTOs;

namespace DogBarbershopAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentTypesController : ControllerBase
{
    private readonly DogBarbershopDbContext _context;

    public AppointmentTypesController(DogBarbershopDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<AppointmentTypeResponse>>> GetAppointmentTypes()
    {
        var types = await _context.AppointmentTypes
            .Select(at => new AppointmentTypeResponse
            {
                Id = at.Id,
                Name = at.Name,
                DurationMinutes = at.DurationMinutes,
                Price = at.Price
            })
            .ToListAsync();

        return Ok(types);
    }
}

