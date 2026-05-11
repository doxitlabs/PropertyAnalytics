namespace PropertyAnalytics.Domain.Entities;

public class Booking
{
    public int Id { get; set; }
    public int PropertyId { get; set; }
    public Property Property { get; set; } = null!;
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public DateTime ViewingDate { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled, Completed
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
