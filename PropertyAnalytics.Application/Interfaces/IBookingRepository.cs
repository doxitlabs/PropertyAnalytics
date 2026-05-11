using PropertyAnalytics.Domain.Entities;

namespace PropertyAnalytics.Application.Interfaces;

public interface IBookingRepository
{
    Task<IEnumerable<Booking>> GetAllAsync();
    Task<IEnumerable<Booking>> GetByPropertyIdAsync(int propertyId);
    Task<Booking?> GetByIdAsync(int id);
    Task<Booking> CreateAsync(Booking booking);
    Task<Booking> UpdateStatusAsync(int id, string status);
    Task DeleteAsync(int id);
}
