using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Application.DTOs.Property;
using PropertyAnalytics.Domain.Entities;
using PropertyAnalytics.Database.Persistence;
using PropertyAnalytics.Database.Services;

namespace PropertyAnalytics.Application.Services;

public class PropertyService(MasterDbContext db, PropertyDbProviderService dbProvider)
{
    public async Task<IList<PropertyDto>> GetForUserAsync(int userId)
    {
        return await db.UserProperties
            .Where(up => up.UserId == userId)
            .Select(up => up.Property)
            .Where(p => p.IsActive)
            .Select(p => new PropertyDto(p.Id, p.Name, p.Address, p.Type, p.TotalRooms, p.CreatedAt, p.IsActive))
            .ToListAsync();
    }

    public async Task<PropertyDto?> GetByIdAsync(int propertyId, int userId)
    {
        var hasAccess = await db.UserProperties
            .AnyAsync(up => up.PropertyId == propertyId && up.UserId == userId);
        if (!hasAccess) return null;

        return await db.Properties
            .Where(p => p.Id == propertyId)
            .Select(p => new PropertyDto(p.Id, p.Name, p.Address, p.Type, p.TotalRooms, p.CreatedAt, p.IsActive))
            .FirstOrDefaultAsync();
    }

    public async Task<PropertyDto> CreateAsync(CreatePropertyDto dto, int userId)
    {
        // Build per-property connection string
        var dbName = $"PropertyAnalytics_Property_{Guid.NewGuid():N}";
        var baseCs = dto.MasterConnectionString;
        var propertyCs = baseCs.Contains("Database=")
            ? System.Text.RegularExpressions.Regex.Replace(baseCs, @"Database=[^;]+", $"Database={dbName}")
            : baseCs + $";Database={dbName}";

        var property = new Property
        {
            Name = dto.Name,
            Address = dto.Address,
            Type = dto.Type,
            TotalRooms = dto.TotalRooms,
            ConnectionString = propertyCs
        };

        db.Properties.Add(property);
        await db.SaveChangesAsync();

        // Link user to property
        db.UserProperties.Add(new UserProperty { UserId = userId, PropertyId = property.Id, Role = "Owner" });
        await db.SaveChangesAsync();

        // Provision the per-property database
        await dbProvider.ProvisionAsync(propertyCs);

        return new PropertyDto(property.Id, property.Name, property.Address, property.Type, property.TotalRooms, property.CreatedAt, property.IsActive);
    }

    public async Task<PropertyDto?> UpdateAsync(int propertyId, UpdatePropertyDto dto, int userId)
    {
        var up = await db.UserProperties
            .Include(x => x.Property)
            .FirstOrDefaultAsync(x => x.PropertyId == propertyId && x.UserId == userId);
        if (up is null) return null;

        up.Property.Name = dto.Name;
        up.Property.Address = dto.Address;
        up.Property.Type = dto.Type;
        up.Property.TotalRooms = dto.TotalRooms;
        await db.SaveChangesAsync();

        return new PropertyDto(up.Property.Id, up.Property.Name, up.Property.Address, up.Property.Type, up.Property.TotalRooms, up.Property.CreatedAt, up.Property.IsActive);
    }

    public async Task<bool> DeleteAsync(int propertyId, int userId)
    {
        var up = await db.UserProperties
            .Include(x => x.Property)
            .FirstOrDefaultAsync(x => x.PropertyId == propertyId && x.UserId == userId);
        if (up is null) return false;

        up.Property.IsActive = false;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<string?> GetConnectionStringAsync(int propertyId, int userId)
    {
        var hasAccess = await db.UserProperties
            .AnyAsync(up => up.PropertyId == propertyId && up.UserId == userId);
        if (!hasAccess) return null;

        return await db.Properties
            .Where(p => p.Id == propertyId)
            .Select(p => p.ConnectionString)
            .FirstOrDefaultAsync();
    }
}
