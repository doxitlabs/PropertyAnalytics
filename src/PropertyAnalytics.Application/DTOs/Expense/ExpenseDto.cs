namespace PropertyAnalytics.Application.DTOs.Expense;

public record ExpenseDto(int Id, string Category, decimal Amount, DateTime Date, string Description, DateTime CreatedAt);

public record CreateExpenseDto(string Category, decimal Amount, DateTime Date, string Description);

public record UpdateExpenseDto(string Category, decimal Amount, DateTime Date, string Description);
