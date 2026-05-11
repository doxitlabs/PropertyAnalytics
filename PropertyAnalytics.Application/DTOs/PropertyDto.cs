namespace PropertyAnalytics.Application.DTOs;

public class PropertyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal PricePerSqm { get; set; }
    public decimal AreaSqm { get; set; }
    public decimal TotalPrice { get; set; }
    public int DaysOnMarket { get; set; }
    public bool IsActive { get; set; }
    public DateTime ListedAt { get; set; }
    public DateTime? SoldAt { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int BookingsCount { get; set; }
}

public class CreatePropertyDto
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal PricePerSqm { get; set; }
    public decimal AreaSqm { get; set; }
    public decimal TotalPrice { get; set; }
    public int DaysOnMarket { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
}

public class DashboardStatsDto
{
    public decimal AvgPricePerSqm { get; set; }
    public int ActiveListings { get; set; }
    public double AvgDaysOnMarket { get; set; }
    public int TotalTransactions { get; set; }
    public decimal AvgPricePerSqmChange { get; set; }
    public decimal ActiveListingsChange { get; set; }
    public double DaysOnMarketChange { get; set; }
    public decimal TransactionsChangeYoY { get; set; }
    public List<PriceTrendDto> PriceTrend { get; set; } = new();
    public List<CategoryCountDto> ByCategory { get; set; } = new();
    public List<CityStatsDto> TopCities { get; set; } = new();
}

public class PriceTrendDto
{
    public string Month { get; set; } = string.Empty;
    public decimal AvgPrice { get; set; }
}

public class CategoryCountDto
{
    public string Category { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class CityStatsDto
{
    public string City { get; set; } = string.Empty;
    public decimal AvgPrice { get; set; }
    public int Count { get; set; }
}
