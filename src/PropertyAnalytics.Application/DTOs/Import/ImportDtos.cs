namespace PropertyAnalytics.Application.DTOs.Import;

public record ImportPreviewRequest(
    string SourceConnectionString,
    string ReservationsTable);

public record ImportPreviewResult(
    string[] Columns,
    int TotalRows,
    List<Dictionary<string, string?>> SampleRows);

public record ImportExecuteRequest(
    string Name,
    string Address,
    string Type,
    int TotalRooms,
    string SourceConnectionString,
    string ReservationsTable,
    string CheckInColumn,
    string CheckOutColumn,
    string RevenueColumn,
    string? GuestNameColumn,
    string? GuestEmailColumn,
    string? StatusColumn);

public record ImportResult(
    int PropertyId,
    string PropertyName,
    int ImportedBookings);
