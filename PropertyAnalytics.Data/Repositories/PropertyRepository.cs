using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Application.Interfaces;
using PropertyAnalytics.Domain.Entities;

namespace PropertyAnalytics.Data.Repositories;

public class PropertyRepository : IPropertyRepository
{
    private readonly AppDbContext _db;
    public PropertyRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Property>> GetAllAsync() =>
        await _db.Properties.Include(p => p.Bookings).OrderByDescending(p => p.ListedAt).ToListAsync();

    public async Task<Property?> GetByIdAsync(int id) =>
        await _db.Properties.Include(p => p.Bookings).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Property> CreateAsync(Property property)
    {
        _db.Properties.Add(property);
        await _db.SaveChangesAsync();
        return property;
    }

    public async Task<Property> UpdateAsync(Property property)
    {
        _db.Properties.Update(property);
        await _db.SaveChangesAsync();
        return property;
    }

    public async Task DeleteAsync(int id)
    {
        var p = await _db.Properties.FindAsync(id);
        if (p != null) { _db.Properties.Remove(p); await _db.SaveChangesAsync(); }
    }

    public async Task<IEnumerable<Property>> GetByCityAsync(string city) =>
        await _db.Properties.Where(p => p.City == city).ToListAsync();

    public async Task<IEnumerable<Property>> GetByCategoryAsync(string category) =>
        await _db.Properties.Where(p => p.Category == category).ToListAsync();
}
