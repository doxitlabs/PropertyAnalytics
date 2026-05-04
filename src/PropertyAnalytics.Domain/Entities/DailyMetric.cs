namespace PropertyAnalytics.Domain.Entities;

public class DailyMetric
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public decimal Expenses { get; set; }
    public decimal Profit => Revenue - Expenses;
    public int OccupiedRooms { get; set; }
    public int TotalRooms { get; set; }
    public decimal OccupancyRate => TotalRooms > 0 ? (decimal)OccupiedRooms / TotalRooms * 100 : 0;
    public decimal ADR => OccupiedRooms > 0 ? Revenue / OccupiedRooms : 0;
    public DateTime ComputedAt { get; set; } = DateTime.UtcNow;
}
