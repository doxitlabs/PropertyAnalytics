namespace PropertyAnalytics.Application.DTOs.Analytics;

public record AnalyticsSummaryDto(
    decimal TotalRevenue,
    decimal TotalExpenses,
    decimal Profit,
    decimal OccupancyRate,
    decimal ADR,
    int TotalBookings,
    decimal RevenueTrend,      // % change vs previous period
    decimal OccupancyTrend,
    IList<AlertDto> Alerts
);

public record RevenueDataDto(DateTime Date, decimal Revenue, decimal Expenses, decimal Profit);

public record OccupancyDataDto(DateTime Date, decimal OccupancyRate, int OccupiedRooms, int TotalRooms);

public record AlertDto(string Type, string Message, string Severity); // Info, Warning, Critical
