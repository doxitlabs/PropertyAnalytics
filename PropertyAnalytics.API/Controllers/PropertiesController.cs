using Microsoft.AspNetCore.Mvc;
using PropertyAnalytics.Application.DTOs;
using PropertyAnalytics.Application.Interfaces;
using PropertyAnalytics.Domain.Entities;

namespace PropertyAnalytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyRepository _repo;
    public PropertiesController(IPropertyRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var props = await _repo.GetAllAsync();
        var dtos = props.Select(p => ToDto(p));
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p == null) return NotFound();
        return Ok(ToDto(p));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePropertyDto dto)
    {
        var p = new Property
        {
            Name = dto.Name,
            Address = dto.Address,
            City = dto.City,
            Category = dto.Category,
            PricePerSqm = dto.PricePerSqm,
            AreaSqm = dto.AreaSqm,
            TotalPrice = dto.TotalPrice,
            DaysOnMarket = dto.DaysOnMarket,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            IsActive = true,
            ListedAt = DateTime.UtcNow
        };
        var created = await _repo.CreateAsync(p);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDto(created));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreatePropertyDto dto)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p == null) return NotFound();
        p.Name = dto.Name;
        p.Address = dto.Address;
        p.City = dto.City;
        p.Category = dto.Category;
        p.PricePerSqm = dto.PricePerSqm;
        p.AreaSqm = dto.AreaSqm;
        p.TotalPrice = dto.TotalPrice;
        p.DaysOnMarket = dto.DaysOnMarket;
        p.Description = dto.Description;
        p.ImageUrl = dto.ImageUrl;
        await _repo.UpdateAsync(p);
        return Ok(ToDto(p));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repo.DeleteAsync(id);
        return NoContent();
    }

    private static PropertyDto ToDto(Property p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Address = p.Address,
        City = p.City,
        Category = p.Category,
        PricePerSqm = p.PricePerSqm,
        AreaSqm = p.AreaSqm,
        TotalPrice = p.TotalPrice,
        DaysOnMarket = p.DaysOnMarket,
        IsActive = p.IsActive,
        ListedAt = p.ListedAt,
        SoldAt = p.SoldAt,
        Description = p.Description,
        ImageUrl = p.ImageUrl,
        BookingsCount = p.Bookings?.Count ?? 0
    };
}
