using Microsoft.AspNetCore.Mvc;
using DogBarbershopAPI.DTOs;
using DogBarbershopAPI.Services;

namespace DogBarbershopAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || 
            string.IsNullOrWhiteSpace(request.Password) || 
            string.IsNullOrWhiteSpace(request.FirstName))
        {
            return BadRequest("Username, password, and first name are required.");
        }

        var result = await _authService.RegisterAsync(request);

        if (result == null)
        {
            return Conflict("Username already exists.");
        }

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Username and password are required.");
        }

        var result = await _authService.LoginAsync(request);

        if (result == null)
        {
            return Unauthorized("Invalid username or password.");
        }

        return Ok(result);
    }
}

