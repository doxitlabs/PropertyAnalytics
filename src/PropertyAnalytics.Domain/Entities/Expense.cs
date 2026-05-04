namespace PropertyAnalytics.Domain.Entities;

public class Expense
{
    public int Id { get; set; }
    public string Category { get; set; } = string.Empty; // Maintenance, Utilities, Cleaning, Supplies, Other
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
