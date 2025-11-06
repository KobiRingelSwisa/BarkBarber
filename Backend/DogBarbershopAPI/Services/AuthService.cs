using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using DogBarbershopAPI.Data;
using DogBarbershopAPI.DTOs;

namespace DogBarbershopAPI.Services;

public class AuthService : IAuthService
{
    private readonly DogBarbershopDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IConfiguration _configuration;

    public AuthService(
        DogBarbershopDbContext context,
        IPasswordService passwordService,
        IConfiguration configuration)
    {
        _context = context;
        _passwordService = passwordService;
        _configuration = configuration;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null || !_passwordService.VerifyPassword(request.Password, user.PasswordHash))
        {
            return null;
        }

        var token = GenerateToken(user.Id, user.Username);

        return new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Username = user.Username,
            FirstName = user.FirstName
        };
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (existingUser != null)
        {
            return null;
        }

        var hashedPassword = _passwordService.HashPassword(request.Password);

        var user = new Models.User
        {
            Username = request.Username,
            PasswordHash = hashedPassword,
            FirstName = request.FirstName,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateToken(user.Id, user.Username);

        return new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Username = user.Username,
            FirstName = user.FirstName
        };
    }

    public string GenerateToken(int userId, string username)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, username)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

