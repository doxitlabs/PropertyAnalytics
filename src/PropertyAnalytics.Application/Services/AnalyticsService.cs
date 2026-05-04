using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Application.DTOs.Analytics;
using PropertyAnalytics.Database.Services;

namespace PropertyAnalytics.Application.Services;

public class AnalyticsService(PropertyDbProviderService dbProvider)
{
    public async Task<AnalyticsSummaryDto> GetSummaryAsync(string cs, DateTime from, DateTime to)
    {
        var ctx = dbProvider.GetContext(cs);

        var bookings = await ctx.Bookings
            .Where(b => b.CheckIn >= from && b.CheckOut <= to)
            .ToListAsync();

        var expenses = await ctx.Expenses
            .Where(e => e.Date >= from && e.Date <= to)
            .ToListAsync();

        var totalRevenue = bookings.Sum(b => b.Revenue);
        var totalExpenses = expenses.Sum(e => e.Amount);
        var profit = totalRevenue - totalExpenses;
        var totalDays = (to - from).Days;
        var occupiedNights = bookings.Sum(b => b.Nights);
        var occupancyRate = totalDays > 0 ? Math.Round((decimal)occupiedNights / totalDays * 100, 1) : 0;
        var adr = occupiedNights > 0 ? Math.Round(totalRevenue / occupiedNights, 2) : 0;

        // Revenue vs previous period
        var periodLength = to - from;
        var prevFrom = from - periodLength;
        var prevBookings = await ctx.Bookings
            .Where(b => b.CheckIn >= prevFrom && b.CheckOut <= from)
            .SumAsync(b => (decimal?)b.Revenue) ?? 0;
        var revenueTrend = prevBookings > 0 ? Math.Round((totalRevenue - prevBookings) / prevBookings * 100, 1) : 0;

        var prevOccupied = await ctx.Bookings
            .Where(b => b.CheckIn >= prevFrom && b.CheckOut <= from)
            .SumAsync(b => (int?)b.Nights) ?? 0;
        var prevOccupancyRate = totalDays > 0 ? (decimal)prevOccupied / totalDays * 100 : 0;
        var occupancyTrend = prevOccupancyRate > 0
            ? Math.Round((occupancyRate - prevOccupancyRate) / prevOccupancyRate * 100, 1)
            : 0;

        // Revenue by month
        var revenueData = bookings
            .GroupBy(b => new { b.CheckIn.Year, b.CheckIn.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g =>
            {
                var monthRevenue = g.Sum(b => b.Revenue);
                var monthExpenses = expenses
                    .Where(e => e.Date.Year == g.Key.Year && e.Date.Month == g.Key.Month)
                    .Sum(e => e.Amount);
                return new RevenueDataDto(
                    new DateTime(g.Key.Year, g.Key.Month, 1),
                    monthRevenue,
                    monthExpenses,
                    monthRevenue - monthExpenses
                );
            })
            .ToList();

        // Occupancy by month — we need TotalRooms; use DailyMetrics if available, else approximate
        var dailyMetrics = await ctx.DailyMetrics
            .Where(m => m.Date >= from && m.Date <= to)
            .ToListAsync();

        var occupancyData = bookings
            .GroupBy(b => new { b.CheckIn.Year, b.CheckIn.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g =>
            {
                var daysInMonth = DateTime.DaysInMonth(g.Key.Year, g.Key.Month);
                var occupied = g.Sum(b => b.Nights);
                var monthMetrics = dailyMetrics
                    .Where(m => m.Date.Year == g.Key.Year && m.Date.Month == g.Key.Month)
                    .ToList();
                var avgOccupied = monthMetrics.Count > 0
                    ? (int)Math.Round(monthMetrics.Average(m => m.OccupiedRooms))
                    : occupied / daysInMonth;
                var rate = daysInMonth > 0 ? Math.Round((decimal)occupied / daysInMonth * 100, 1) : 0;
                return new OccupancyDataDto(
                    new DateTime(g.Key.Year, g.Key.Month, 1),
                    rate,
                    avgOccupied,
                    0 // TotalRooms is on the Property entity (master DB), not per-property DB
                );
            })
            .ToList();

        var alerts = GenerateAlerts(revenueData, occupancyData);

        return new AnalyticsSummaryDto(
            totalRevenue, totalExpenses, profit,
            occupancyRate, adr, bookings.Count,
            revenueTrend, occupancyTrend, alerts);
    }

    private static List<AlertDto> GenerateAlerts(List<RevenueDataDto> revenue, List<OccupancyDataDto> occupancy)
    {
        var alerts = new List<AlertDto>();

        // Revenue drop >20% month-over-month
        for (int i = 1; i < revenue.Count; i++)
        {
            var prev = revenue[i - 1].Revenue;
            var curr = revenue[i].Revenue;
            if (prev > 0 && (prev - curr) / prev > 0.20m)
            {
                var pct = Math.Round((prev - curr) / prev * 100);
                alerts.Add(new AlertDto(
                    "revenue_drop",
                    $"Revenue dropped by {pct}% in {revenue[i].Date:MMM yyyy}",
                    "warning"));
            }
        }

        // Occupancy <30%
        foreach (var o in occupancy)
        {
            if (o.OccupancyRate < 30)
            {
                alerts.Add(new AlertDto(
                    "low_occupancy",
                    $"Low occupancy ({o.OccupancyRate:F0}%) in {o.Date:MMM yyyy}",
                    "danger"));
            }
        }

        // 3-month negative profit trend
        if (revenue.Count >= 3)
        {
            var last3 = revenue.TakeLast(3).ToList();
            if (last3.All(r => r.Profit < 0))
                alerts.Add(new AlertDto(
                    "negative_trend",
                    "Negative profit for 3 consecutive months",
                    "danger"));
        }

        return alerts;
    }
}
