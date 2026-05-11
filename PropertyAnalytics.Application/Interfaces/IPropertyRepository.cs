using PropertyAnalytics.Domain.Entities;

namespace PropertyAnalytics.Application.Interfaces;

public interface IPropertyRepository
{
    Task<IEnumerable<Property>> GetAllAsync();
    Task<Property?> GetByIdAsync(int id);
    Task<Property> CreateAsync(Property property);
    Task<Property> UpdateAsync(Property property);
    Task DeleteAsync(int id);
    Task<IEnumerable<Property>> GetByCityAsync(string city);
    Task<IEnumerable<Property>> GetByCategoryAsync(string category);
}
