using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Application.Interfaces;
using PropertyAnalytics.Domain.Entities;

namespace PropertyAnalytics.Data.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly AppDbContext _db;
    public BookingRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Booking>> GetAllAsync() =>
        await _db.Bookings.Include(b => b.Property).OrderByDescending(b => b.CreatedAt).ToListAsync();

    public async Task<IEnumerable<Booking>> GetByPropertyIdAsync(int propertyId) =>
        await _db.Bookings.Where(b => b.PropertyId == propertyId)
                          .OrderByDescending(b => b.ViewingDate).ToListAsync();

    public async Task<Booking?> GetByIdAsync(int id) =>
        await _db.Bookings.Include(b => b.Property).FirstOrDefaultAsync(b => b.Id == id);

    public async Task<Booking> CreateAsync(Booking booking)
    {
        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();
        return booking;
    }

    public async Task<Booking> UpdateStatusAsync(int id, string status)
    {
        var b = await _db.Bookings.FindAsync(id) ?? throw new KeyNotFoundException();
        b.Status = status;
        await _db.SaveChangesAsync();
        return b;
    }

    public async Task DeleteAsync(int id)
    {
        var b = await _db.Bookings.FindAsync(id);
        if (b != null) { _db.Bookings.Remove(b); await _db.SaveChangesAsync(); }
    }
}
