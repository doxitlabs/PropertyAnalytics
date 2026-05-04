namespace PropertyAnalytics.Application.DTOs.Property;

public record PropertyDto(int Id, string Name, string Address, string Type, int TotalRooms, DateTime CreatedAt, bool IsActive);

public record CreatePropertyDto(string Name, string Address, string Type, int TotalRooms, string MasterConnectionString);

public record UpdatePropertyDto(string Name, string Address, string Type, int TotalRooms);
