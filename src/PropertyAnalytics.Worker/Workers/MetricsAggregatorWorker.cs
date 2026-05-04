using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Database.Persistence;
using PropertyAnalytics.Database.Services;

namespace PropertyAnalytics.Worker.Workers;

public class MetricsAggregatorWorker(
    ILogger<MetricsAggregatorWorker> logger,
    IServiceScopeFactory scopeFactory,
    IConfiguration config) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("MetricsAggregatorWorker started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await AggregateAllPropertiesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error during metrics aggregation.");
            }

            // Run every hour
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }

    private async Task AggregateAllPropertiesAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var masterDb = scope.ServiceProvider.GetRequiredService<MasterDbContext>();
        var dbProvider = scope.ServiceProvider.GetRequiredService<PropertyDbProviderService>();

        var properties = await masterDb.Properties
            .Where(p => p.IsActive)
            .Select(p => new { p.Id, p.ConnectionString })
            .ToListAsync(ct);

        var hubUrl = config["SignalR:HubUrl"];

        foreach (var prop in properties)
        {
            try
            {
                await AggregatePropertyAsync(dbProvider, prop.ConnectionString, prop.Id, hubUrl, ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to aggregate property {Id}", prop.Id);
            }
        }
    }

    private async Task AggregatePropertyAsync(
        PropertyDbProviderService dbProvider,
        string cs,
        int propertyId,
        string? hubUrl,
        CancellationToken ct)
    {
        var ctx = dbProvider.GetContext(cs);
        var today = DateTime.UtcNow.Date;

        var existingMetric = await ctx.DailyMetrics
            .FirstOrDefaultAsync(m => m.Date == today, ct);

        var revenue = await ctx.Bookings
            .Where(b => b.CheckIn.Date <= today && b.CheckOut.Date >= today)
            .SumAsync(b => (decimal?)b.Revenue / b.Nights ?? 0, ct);

        var expenses = await ctx.Expenses
            .Where(e => e.Date.Date == today)
            .SumAsync(e => (decimal?)e.Amount ?? 0, ct);

        var occupiedRooms = await ctx.Bookings
            .CountAsync(b => b.CheckIn.Date <= today && b.CheckOut.Date > today, ct);

        if (existingMetric is null)
        {
            ctx.DailyMetrics.Add(new Domain.Entities.DailyMetric
            {
                Date = today,
                Revenue = revenue,
                Expenses = expenses,
                OccupiedRooms = occupiedRooms
            });
        }
        else
        {
            existingMetric.Revenue = revenue;
            existingMetric.Expenses = expenses;
            existingMetric.OccupiedRooms = occupiedRooms;
        }

        await ctx.SaveChangesAsync(ct);

        // Push real-time update via SignalR
        if (!string.IsNullOrEmpty(hubUrl))
        {
            await PushSignalRUpdateAsync(hubUrl, propertyId, revenue, expenses, ct);
        }

        logger.LogInformation("Aggregated metrics for property {Id}: revenue={Revenue}, expenses={Expenses}", propertyId, revenue, expenses);
    }

    private static async Task PushSignalRUpdateAsync(string hubUrl, int propertyId, decimal revenue, decimal expenses, CancellationToken ct)
    {
        var connection = new HubConnectionBuilder()
            .WithUrl(hubUrl)
            .Build();

        try
        {
            await connection.StartAsync(ct);
            await connection.InvokeAsync("SendMetricsUpdate", $"property-{propertyId}", new
            {
                propertyId,
                revenue,
                expenses,
                profit = revenue - expenses,
                updatedAt = DateTime.UtcNow
            }, ct);
        }
        finally
        {
            await connection.DisposeAsync();
        }
    }
}
