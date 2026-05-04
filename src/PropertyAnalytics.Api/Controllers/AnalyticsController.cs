using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyAnalytics.Application.Services;

namespace PropertyAnalytics.API.Controllers;

[ApiController]
[Route("api/properties/{propertyId}/analytics")]
[Authorize]
public class AnalyticsController(AnalyticsService analyticsService, PropertyService propertyService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(
        int propertyId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var cs = await propertyService.GetConnectionStringAsync(propertyId, UserId);
        if (cs is null) return Forbid();

        var dateFrom = from ?? DateTime.UtcNow.AddMonths(-12);
        var dateTo = to ?? DateTime.UtcNow;

        return Ok(await analyticsService.GetSummaryAsync(cs, dateFrom, dateTo));
    }
}
