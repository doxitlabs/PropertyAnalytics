using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PropertyAnalytics.Database.Persistence;

namespace PropertyAnalytics.Database.Services;

/// <summary>
/// Resolves the per-property DbContext from a connection string.
/// Automatically creates and migrates the database on first access.
/// </summary>
public class PropertyDbProviderService(ILogger<PropertyDbProviderService> logger)
{
    private readonly Dictionary<string, PropertyDbContext> _cache = new();

    public PropertyDbContext GetContext(string connectionString)
    {
        if (_cache.TryGetValue(connectionString, out var cached))
            return cached;

        var options = new DbContextOptionsBuilder<PropertyDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        var context = new PropertyDbContext(options);
        _cache[connectionString] = context;
        return context;
    }

    public async Task ProvisionAsync(string connectionString)
    {
        logger.LogInformation("Provisioning property database...");

        var options = new DbContextOptionsBuilder<PropertyDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        await using var context = new PropertyDbContext(options);
        await context.Database.MigrateAsync();

        logger.LogInformation("Property database provisioned successfully.");
    }

    public async Task<bool> TestConnectionAsync(string connectionString)
    {
        try
        {
            var options = new DbContextOptionsBuilder<PropertyDbContext>()
                .UseSqlServer(connectionString)
                .Options;
            await using var context = new PropertyDbContext(options);
            return await context.Database.CanConnectAsync();
        }
        catch
        {
            return false;
        }
    }
}
