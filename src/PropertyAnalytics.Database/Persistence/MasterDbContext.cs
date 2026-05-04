using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Domain.Entities;

namespace PropertyAnalytics.Database.Persistence;

public class MasterDbContext(DbContextOptions<MasterDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<UserProperty> UserProperties => Set<UserProperty>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserProperty>()
            .HasKey(up => new { up.UserId, up.PropertyId });

        modelBuilder.Entity<UserProperty>()
            .HasOne(up => up.User)
            .WithMany(u => u.UserProperties)
            .HasForeignKey(up => up.UserId);

        modelBuilder.Entity<UserProperty>()
            .HasOne(up => up.Property)
            .WithMany(p => p.UserProperties)
            .HasForeignKey(up => up.PropertyId);

        modelBuilder.Entity<Property>()
            .Property(p => p.ConnectionString)
            .HasMaxLength(1000);
    }
}
