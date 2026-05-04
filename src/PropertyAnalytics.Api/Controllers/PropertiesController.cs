using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyAnalytics.Application.DTOs.Property;
using PropertyAnalytics.Application.Services;

namespace PropertyAnalytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PropertiesController(PropertyService propertyService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await propertyService.GetForUserAsync(UserId));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await propertyService.GetByIdAsync(id, UserId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreatePropertyDto dto)
    {
        var result = await propertyService.CreateAsync(dto, UserId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdatePropertyDto dto)
    {
        var result = await propertyService.UpdateAsync(id, dto, UserId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await propertyService.DeleteAsync(id, UserId);
        return result ? NoContent() : NotFound();
    }
}
