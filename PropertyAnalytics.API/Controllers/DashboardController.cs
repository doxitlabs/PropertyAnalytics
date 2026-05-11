using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Application.DTOs;
using PropertyAnalytics.Data;

namespace PropertyAnalytics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    public DashboardController(AppDbContext db) => _db = db;

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var all = await _db.Properties.ToListAsync();
        var active = all.Where(p => p.IsActive).ToList();
        var sold = all.Where(p => !p.IsActive && p.SoldAt != null).ToList();

        var avgPrice = active.Any() ? active.Average(p => p.PricePerSqm) : 0;
        var avgDays = active.Any() ? active.Average(p => p.DaysOnMarket) : 0;

        // Simulirani trend - zadnjih 12 mjeseci na bazi postojećih podataka
        var trend = new List<PriceTrendDto>();
        var months = new[] { "Svi", "Lip", "Srp", "Kol", "Ruj", "Lis", "Stu", "Pro", "Sij", "Velj", "Ožu", "Tra" };
        var basePrice = avgPrice > 0 ? (double)avgPrice * 0.85 : 2400;
        for (int i = 0; i < 12; i++)
        {
            trend.Add(new PriceTrendDto
            {
                Month = months[i],
                AvgPrice = (decimal)(basePrice + (basePrice * 0.015 * i))
            });
        }

        var byCategory = all.GroupBy(p => p.Category)
            .Select(g => new CategoryCountDto { Category = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count).ToList();

        var topCities = all.GroupBy(p => p.City)
            .Select(g => new CityStatsDto
            {
                City = g.Key,
                AvgPrice = g.Average(p => p.PricePerSqm),
                Count = g.Count()
            })
            .OrderByDescending(x => x.AvgPrice).Take(5).ToList();

        var stats = new DashboardStatsDto
        {
            AvgPricePerSqm = Math.Round((decimal)avgPrice, 0),
            ActiveListings = active.Count,
            AvgDaysOnMarket = Math.Round(avgDays, 0),
            TotalTransactions = sold.Count,
            AvgPricePerSqmChange = 4.2m,
            ActiveListingsChange = -1.8m,
            DaysOnMarketChange = -6,
            TransactionsChangeYoY = 11.3m,
            PriceTrend = trend,
            ByCategory = byCategory,
            TopCities = topCities
        };

        return Ok(stats);
    }
}
