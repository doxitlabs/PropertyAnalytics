using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Application.DTOs.Import;
using PropertyAnalytics.Application.DTOs.Property;
using PropertyAnalytics.Database.Persistence;
using PropertyAnalytics.Database.Services;
using PropertyAnalytics.Domain.Entities;

namespace PropertyAnalytics.Application.Services;

public class ImportService(
    MasterDbContext masterDb,
    PropertyService propertyService,
    PropertyDbProviderService dbProvider)
{
    public async Task<ImportPreviewResult> PreviewAsync(ImportPreviewRequest req)
    {
        await using var conn = new SqlConnection(req.SourceConnectionString);
        await conn.OpenAsync();

        int totalRows = 0;
        var columns = new List<string>();
        var sampleRows = new List<Dictionary<string, string?>>();

        // Count total rows
        await using (var cmd = new SqlCommand(
            $"SELECT COUNT(*) FROM [{EscapeIdentifier(req.ReservationsTable)}]", conn))
        {
            totalRows = (int)(await cmd.ExecuteScalarAsync() ?? 0);
        }

        // Fetch sample rows + detect columns
        await using (var cmd = new SqlCommand(
            $"SELECT TOP 5 * FROM [{EscapeIdentifier(req.ReservationsTable)}]", conn))
        await using (var reader = await cmd.ExecuteReaderAsync())
        {
            for (int i = 0; i < reader.FieldCount; i++)
                columns.Add(reader.GetName(i));

            while (await reader.ReadAsync())
            {
                var row = new Dictionary<string, string?>();
                for (int i = 0; i < reader.FieldCount; i++)
                    row[columns[i]] = reader.IsDBNull(i) ? null : reader.GetValue(i)?.ToString();
                sampleRows.Add(row);
            }
        }

        return new ImportPreviewResult(columns.ToArray(), totalRows, sampleRows);
    }

    public async Task<ImportResult> ExecuteAsync(ImportExecuteRequest req, int userId)
    {
        // 1. Create property + provision its database
        var createDto = new CreatePropertyDto(req.Name, req.Address, req.Type, req.TotalRooms);
        var property = await propertyService.CreateAsync(createDto, userId);

        // 2. Get per-property connection string from master DB
        var propCs = await masterDb.Properties
            .Where(p => p.Id == property.Id)
            .Select(p => p.ConnectionString)
            .FirstAsync();

        // 3. Read reservations from source DB
        var bookings = new List<Booking>();

        await using var conn = new SqlConnection(req.SourceConnectionString);
        await conn.OpenAsync();

        await using var cmd = new SqlCommand(
            $"SELECT * FROM [{EscapeIdentifier(req.ReservationsTable)}]", conn);
        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            try
            {
                var checkIn = ParseDate(reader, req.CheckInColumn);
                var checkOut = ParseDate(reader, req.CheckOutColumn);
                var revenue = ParseDecimal(reader, req.RevenueColumn);

                if (checkIn == default || checkOut == default || checkOut <= checkIn)
                    continue;

                var booking = new Booking
                {
                    CheckIn = checkIn,
                    CheckOut = checkOut,
                    Revenue = revenue,
                    GuestName = ParseString(reader, req.GuestNameColumn) ?? "Unknown",
                    GuestEmail = ParseString(reader, req.GuestEmailColumn) ?? string.Empty,
                    Status = MapStatus(ParseString(reader, req.StatusColumn)),
                    Source = "Import",
                };
                bookings.Add(booking);
            }
            catch
            {
                // Skip malformed rows
            }
        }

        // 4. Save bookings to property DB
        var propCtx = dbProvider.GetContext(propCs);
        propCtx.Bookings.AddRange(bookings);
        await propCtx.SaveChangesAsync();

        return new ImportResult(property.Id, property.Name, bookings.Count);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private static string EscapeIdentifier(string name) =>
        name.Replace("]", "]]");

    private static DateTime ParseDate(SqlDataReader reader, string column)
    {
        int ordinal = reader.GetOrdinal(column);
        if (reader.IsDBNull(ordinal)) return default;
        var val = reader.GetValue(ordinal);
        return val switch
        {
            DateTime dt => dt,
            DateTimeOffset dto => dto.DateTime,
            _ => DateTime.TryParse(val.ToString(), out var parsed) ? parsed : default
        };
    }

    private static decimal ParseDecimal(SqlDataReader reader, string column)
    {
        int ordinal = reader.GetOrdinal(column);
        if (reader.IsDBNull(ordinal)) return 0m;
        var val = reader.GetValue(ordinal);
        return val switch
        {
            decimal d => d,
            double dbl => (decimal)dbl,
            float f => (decimal)f,
            int i => i,
            long l => l,
            _ => decimal.TryParse(val.ToString(), out var parsed) ? parsed : 0m
        };
    }

    private static string? ParseString(SqlDataReader reader, string? column)
    {
        if (column is null) return null;
        try
        {
            int ordinal = reader.GetOrdinal(column);
            return reader.IsDBNull(ordinal) ? null : reader.GetValue(ordinal)?.ToString();
        }
        catch { return null; }
    }

    private static string MapStatus(string? raw) => raw?.ToLowerInvariant() switch
    {
        "approved" or "confirmed" or "active" => "Confirmed",
        "cancelled" or "canceled" => "Cancelled",
        "completed" or "finished" or "done" => "Completed",
        _ => "Confirmed"
    };
}
