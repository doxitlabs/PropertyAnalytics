using PropertyAnalytics.Domain.Entities;

namespace PropertyAnalytics.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (db.Properties.Any()) return;

        var properties = new List<Property>
        {
            new() { Name = "Stan Trešnjevka", Address = "Voltino 12", City = "Zagreb", Category = "Stan",
                    PricePerSqm = 3200, AreaSqm = 65, TotalPrice = 208000, DaysOnMarket = 18, IsActive = true,
                    ListedAt = DateTime.UtcNow.AddMonths(-2) },
            new() { Name = "Kuća Maksimir", Address = "Kišpatićeva 5", City = "Zagreb", Category = "Kuća",
                    PricePerSqm = 3800, AreaSqm = 180, TotalPrice = 684000, DaysOnMarket = 45, IsActive = true,
                    ListedAt = DateTime.UtcNow.AddMonths(-3) },
            new() { Name = "Stan Spinut", Address = "Put Spinuta 22", City = "Split", Category = "Stan",
                    PricePerSqm = 3100, AreaSqm = 72, TotalPrice = 223200, DaysOnMarket = 30, IsActive = true,
                    ListedAt = DateTime.UtcNow.AddMonths(-1) },
            new() { Name = "Poslovni prostor Centar", Address = "Ilica 44", City = "Zagreb", Category = "Poslovni",
                    PricePerSqm = 4200, AreaSqm = 120, TotalPrice = 504000, DaysOnMarket = 60, IsActive = true,
                    ListedAt = DateTime.UtcNow.AddMonths(-4) },
            new() { Name = "Stan Pešćenica", Address = "Heinzelova 78", City = "Zagreb", Category = "Stan",
                    PricePerSqm = 2900, AreaSqm = 55, TotalPrice = 159500, DaysOnMarket = 12, IsActive = true,
                    ListedAt = DateTime.UtcNow.AddDays(-15) },
            new() { Name = "Kuća Rijeka", Address = "Fiumara 8", City = "Rijeka", Category = "Kuća",
                    PricePerSqm = 2500, AreaSqm = 140, TotalPrice = 350000, DaysOnMarket = 55, IsActive = false,
                    ListedAt = DateTime.UtcNow.AddMonths(-5), SoldAt = DateTime.UtcNow.AddDays(-10) },
            new() { Name = "Garsonijera Osijek", Address = "Europska 3", City = "Osijek", Category = "Stan",
                    PricePerSqm = 1400, AreaSqm = 30, TotalPrice = 42000, DaysOnMarket = 8, IsActive = true,
                    ListedAt = DateTime.UtcNow.AddDays(-10) },
            new() { Name = "Zemljište Zaprešić", Address = "Industrijska 1", City = "Zaprešić", Category = "Zemlja",
                    PricePerSqm = 180, AreaSqm = 1200, TotalPrice = 216000, DaysOnMarket = 90, IsActive = true,
                    ListedAt = DateTime.UtcNow.AddMonths(-6) },
        };

        db.Properties.AddRange(properties);
        await db.SaveChangesAsync();

        var bookings = new List<Booking>
        {
            new() { PropertyId = properties[0].Id, ClientName = "Ana Horvat", ClientEmail = "ana@example.com",
                    ClientPhone = "091 123 4567", ViewingDate = DateTime.UtcNow.AddDays(2), Status = "Confirmed",
                    Notes = "Zainteresirana za hitnu kupnju" },
            new() { PropertyId = properties[0].Id, ClientName = "Marko Šimić", ClientEmail = "marko@example.com",
                    ClientPhone = "098 765 4321", ViewingDate = DateTime.UtcNow.AddDays(5), Status = "Pending" },
            new() { PropertyId = properties[1].Id, ClientName = "Ivana Kovač", ClientEmail = "ivana@example.com",
                    ClientPhone = "095 111 2233", ViewingDate = DateTime.UtcNow.AddDays(1), Status = "Confirmed",
                    Notes = "Dolazi s bračnim partnerom" },
            new() { PropertyId = properties[2].Id, ClientName = "Tomislav Babić", ClientEmail = "tomo@example.com",
                    ClientPhone = "092 444 5566", ViewingDate = DateTime.UtcNow.AddDays(3), Status = "Pending" },
            new() { PropertyId = properties[4].Id, ClientName = "Petra Jurić", ClientEmail = "petra@example.com",
                    ClientPhone = "091 777 8899", ViewingDate = DateTime.UtcNow.AddDays(-2), Status = "Completed",
                    Notes = "Odlično reagirala na oglas" },
        };

        db.Bookings.AddRange(bookings);
        await db.SaveChangesAsync();
    }
}
