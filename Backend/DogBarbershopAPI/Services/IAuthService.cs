using DogBarbershopAPI.DTOs;

namespace DogBarbershopAPI.Services;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);
    string GenerateToken(int userId, string username);
}

