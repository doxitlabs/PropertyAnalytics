namespace PropertyAnalytics.Domain.Entities;

public class Booking
{
    public int Id { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public decimal Revenue { get; set; }
    public string Status { get; set; } = "Confirmed"; // Confirmed, Cancelled, Completed
    public string Source { get; set; } = "Manual"; // Manual, Airbnb, Booking.com
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int Nights => (CheckOut - CheckIn).Days;
    public decimal DailyRate => Nights > 0 ? Revenue / Nights : 0;
}
