using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Domain.Entities;

namespace PropertyAnalytics.Database.Persistence;

/// <summary>
/// Per-property database context — each property has its own SQL Server database.
/// Resolved dynamically at runtime based on the property's connection string.
/// </summary>
public class PropertyDbContext(DbContextOptions<PropertyDbContext> options) : DbContext(options)
{
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<DailyMetric> DailyMetrics => Set<DailyMetric>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>()
            .Property(b => b.Revenue).HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Expense>()
            .Property(e => e.Amount).HasColumnType("decimal(18,2)");

        modelBuilder.Entity<DailyMetric>()
            .Property(d => d.Revenue).HasColumnType("decimal(18,2)");

        modelBuilder.Entity<DailyMetric>()
            .Property(d => d.Expenses).HasColumnType("decimal(18,2)");

        modelBuilder.Entity<DailyMetric>()
            .HasIndex(d => d.Date).IsUnique();
    }
}
