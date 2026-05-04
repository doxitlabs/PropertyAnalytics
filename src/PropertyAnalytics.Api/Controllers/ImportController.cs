using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyAnalytics.Application.DTOs.Import;
using PropertyAnalytics.Application.Services;

namespace PropertyAnalytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ImportController(ImportService importService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Connects to source DB and returns column names + sample rows from the given table.
    /// </summary>
    [HttpPost("preview")]
    public async Task<IActionResult> Preview(ImportPreviewRequest req)
    {
        try
        {
            var result = await importService.PreviewAsync(req);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Creates the property, provisions its database, and imports all reservations.
    /// </summary>
    [HttpPost("execute")]
    public async Task<IActionResult> Execute(ImportExecuteRequest req)
    {
        try
        {
            var result = await importService.ExecuteAsync(req, UserId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
