using Microsoft.AspNetCore.Mvc;
using PropertyAnalytics.Application.DTOs;
using PropertyAnalytics.Application.Interfaces;
using PropertyAnalytics.Domain.Entities;

namespace PropertyAnalytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingRepository _repo;
    public BookingsController(IBookingRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var bookings = await _repo.GetAllAsync();
        return Ok(bookings.Select(ToDto));
    }

    [HttpGet("property/{propertyId}")]
    public async Task<IActionResult> GetByProperty(int propertyId)
    {
        var bookings = await _repo.GetByPropertyIdAsync(propertyId);
        return Ok(bookings.Select(ToDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
    {
        var booking = new Booking
        {
            PropertyId = dto.PropertyId,
            ClientName = dto.ClientName,
            ClientEmail = dto.ClientEmail,
            ClientPhone = dto.ClientPhone,
            ViewingDate = dto.ViewingDate,
            Notes = dto.Notes,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };
        var created = await _repo.CreateAsync(booking);
        var full = await _repo.GetByIdAsync(created.Id);
        return CreatedAtAction(nameof(GetAll), ToDto(full!));
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var booking = await _repo.UpdateStatusAsync(id, dto.Status);
        return Ok(ToDto(booking));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repo.DeleteAsync(id);
        return NoContent();
    }

    private static BookingDto ToDto(Booking b) => new()
    {
        Id = b.Id,
        PropertyId = b.PropertyId,
        PropertyName = b.Property?.Name ?? string.Empty,
        ClientName = b.ClientName,
        ClientEmail = b.ClientEmail,
        ClientPhone = b.ClientPhone,
        ViewingDate = b.ViewingDate,
        Status = b.Status,
        Notes = b.Notes,
        CreatedAt = b.CreatedAt
    };
}

public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
}
