namespace PropertyAnalytics.Application.DTOs.Booking;

public record BookingDto(int Id, string GuestName, string GuestEmail, DateTime CheckIn, DateTime CheckOut, decimal Revenue, string Status, string Source, int Nights, decimal DailyRate, DateTime CreatedAt);

public record CreateBookingDto(string GuestName, string GuestEmail, DateTime CheckIn, DateTime CheckOut, decimal Revenue, string Status, string Source, string Notes);

public record UpdateBookingDto(string GuestName, string GuestEmail, DateTime CheckIn, DateTime CheckOut, decimal Revenue, string Status);
