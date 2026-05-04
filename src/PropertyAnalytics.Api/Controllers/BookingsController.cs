using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyAnalytics.Application.DTOs.Booking;
using PropertyAnalytics.Application.Services;

namespace PropertyAnalytics.API.Controllers;

[ApiController]
[Route("api/properties/{propertyId}/bookings")]
[Authorize]
public class BookingsController(BookingService bookingService, PropertyService propertyService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private async Task<string?> GetCs(int propertyId) =>
        await propertyService.GetConnectionStringAsync(propertyId, UserId);

    [HttpGet]
    public async Task<IActionResult> GetAll(int propertyId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var cs = await GetCs(propertyId);
        if (cs is null) return Forbid();
        return Ok(await bookingService.GetAllAsync(cs, from, to));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int propertyId, int id)
    {
        var cs = await GetCs(propertyId);
        if (cs is null) return Forbid();
        var result = await bookingService.GetByIdAsync(cs, id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(int propertyId, CreateBookingDto dto)
    {
        var cs = await GetCs(propertyId);
        if (cs is null) return Forbid();
        var result = await bookingService.CreateAsync(cs, dto);
        return CreatedAtAction(nameof(GetById), new { propertyId, id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int propertyId, int id, UpdateBookingDto dto)
    {
        var cs = await GetCs(propertyId);
        if (cs is null) return Forbid();
        var result = await bookingService.UpdateAsync(cs, id, dto);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int propertyId, int id)
    {
        var cs = await GetCs(propertyId);
        if (cs is null) return Forbid();
        return await bookingService.DeleteAsync(cs, id) ? NoContent() : NotFound();
    }
}
