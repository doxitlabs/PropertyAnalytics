namespace PropertyAnalytics.Application.DTOs.Auth;

public record LoginDto(string Email, string Password);

public record RegisterDto(string Email, string Password);

public record AuthResponseDto(string Token, string Email, string Role, int UserId);
