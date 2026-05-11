namespace PropertyAnalytics.Application.DTOs;

public class BookingDto
{
    public int Id { get; set; }
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public DateTime ViewingDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateBookingDto
{
    public int PropertyId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public DateTime ViewingDate { get; set; }
    public string? Notes { get; set; }
}
