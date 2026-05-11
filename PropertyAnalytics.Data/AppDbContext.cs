using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Domain.Entities;

namespace PropertyAnalytics.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Property> Properties => Set<Property>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Property>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(200);
            e.Property(x => x.City).IsRequired().HasMaxLength(100);
            e.Property(x => x.Category).IsRequired().HasMaxLength(50);
            e.Property(x => x.PricePerSqm).HasColumnType("decimal(18,2)");
            e.Property(x => x.AreaSqm).HasColumnType("decimal(18,2)");
            e.Property(x => x.TotalPrice).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Booking>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.ClientName).IsRequired().HasMaxLength(100);
            e.Property(x => x.ClientEmail).IsRequired().HasMaxLength(200);
            e.Property(x => x.Status).IsRequired().HasMaxLength(20);
            e.HasOne(x => x.Property)
             .WithMany(x => x.Bookings)
             .HasForeignKey(x => x.PropertyId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
