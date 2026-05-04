using Microsoft.AspNetCore.Mvc;
using PropertyAnalytics.Application.DTOs.Auth;
using PropertyAnalytics.Application.Services;

namespace PropertyAnalytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await authService.LoginAsync(dto);
        return result is null ? Unauthorized() : Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var result = await authService.RegisterAsync(dto);
        return result is null ? Conflict(new { message = "Email already in use" }) : Ok(result);
    }
}
