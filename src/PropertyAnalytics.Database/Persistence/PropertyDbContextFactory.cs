using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PropertyAnalytics.Database.Persistence;

/// <summary>
/// Used by EF Core Tools at design time to create PropertyDbContext for migrations.
/// </summary>
public class PropertyDbContextFactory : IDesignTimeDbContextFactory<PropertyDbContext>
{
    public PropertyDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<PropertyDbContext>();
        optionsBuilder.UseSqlServer(
            "Server=localhost;Database=PropertyAnalytics_Property_Design;Trusted_Connection=True;TrustServerCertificate=True;");
        return new PropertyDbContext(optionsBuilder.Options);
    }
}
