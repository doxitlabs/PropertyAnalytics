namespace PropertyAnalytics.Domain.Entities;

public class Property
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // Stan, Kuća, Zemlja, Poslovni, Garaža
    public decimal PricePerSqm { get; set; }
    public decimal AreaSqm { get; set; }
    public decimal TotalPrice { get; set; }
    public int DaysOnMarket { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime ListedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SoldAt { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
