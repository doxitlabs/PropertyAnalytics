using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Application.DTOs.Booking;
using PropertyAnalytics.Domain.Entities;
using PropertyAnalytics.Database.Services;

namespace PropertyAnalytics.Application.Services;

public class BookingService(PropertyDbProviderService dbProvider)
{
    public async Task<IList<BookingDto>> GetAllAsync(string cs, DateTime? from = null, DateTime? to = null)
    {
        var ctx = dbProvider.GetContext(cs);
        var q = ctx.Bookings.AsQueryable();
        if (from.HasValue) q = q.Where(b => b.CheckIn >= from.Value);
        if (to.HasValue) q = q.Where(b => b.CheckOut <= to.Value);

        return await q.OrderByDescending(b => b.CheckIn)
            .Select(b => ToDto(b))
            .ToListAsync();
    }

    public async Task<BookingDto?> GetByIdAsync(string cs, int id)
    {
        var ctx = dbProvider.GetContext(cs);
        var b = await ctx.Bookings.FindAsync(id);
        return b is null ? null : ToDto(b);
    }

    public async Task<BookingDto> CreateAsync(string cs, CreateBookingDto dto)
    {
        var ctx = dbProvider.GetContext(cs);
        var booking = new Booking
        {
            GuestName = dto.GuestName,
            GuestEmail = dto.GuestEmail,
            CheckIn = dto.CheckIn,
            CheckOut = dto.CheckOut,
            Revenue = dto.Revenue,
            Status = dto.Status,
            Source = dto.Source,
            Notes = dto.Notes
        };
        ctx.Bookings.Add(booking);
        await ctx.SaveChangesAsync();
        return ToDto(booking);
    }

    public async Task<BookingDto?> UpdateAsync(string cs, int id, UpdateBookingDto dto)
    {
        var ctx = dbProvider.GetContext(cs);
        var booking = await ctx.Bookings.FindAsync(id);
        if (booking is null) return null;

        booking.GuestName = dto.GuestName;
        booking.GuestEmail = dto.GuestEmail;
        booking.CheckIn = dto.CheckIn;
        booking.CheckOut = dto.CheckOut;
        booking.Revenue = dto.Revenue;
        booking.Status = dto.Status;
        await ctx.SaveChangesAsync();
        return ToDto(booking);
    }

    public async Task<bool> DeleteAsync(string cs, int id)
    {
        var ctx = dbProvider.GetContext(cs);
        var booking = await ctx.Bookings.FindAsync(id);
        if (booking is null) return false;
        ctx.Bookings.Remove(booking);
        await ctx.SaveChangesAsync();
        return true;
    }

    private static BookingDto ToDto(Booking b) =>
        new(b.Id, b.GuestName, b.GuestEmail, b.CheckIn, b.CheckOut, b.Revenue, b.Status, b.Source, b.Nights, b.DailyRate, b.CreatedAt);
}
