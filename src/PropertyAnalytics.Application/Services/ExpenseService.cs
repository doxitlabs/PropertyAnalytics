using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Application.DTOs.Expense;
using PropertyAnalytics.Domain.Entities;
using PropertyAnalytics.Database.Services;

namespace PropertyAnalytics.Application.Services;

public class ExpenseService(PropertyDbProviderService dbProvider)
{
    public async Task<IList<ExpenseDto>> GetAllAsync(string cs, DateTime? from = null, DateTime? to = null)
    {
        var ctx = dbProvider.GetContext(cs);
        var q = ctx.Expenses.AsQueryable();
        if (from.HasValue) q = q.Where(e => e.Date >= from.Value);
        if (to.HasValue) q = q.Where(e => e.Date <= to.Value);

        return await q.OrderByDescending(e => e.Date)
            .Select(e => new ExpenseDto(e.Id, e.Category, e.Amount, e.Date, e.Description, e.CreatedAt))
            .ToListAsync();
    }

    public async Task<ExpenseDto?> GetByIdAsync(string cs, int id)
    {
        var ctx = dbProvider.GetContext(cs);
        var e = await ctx.Expenses.FindAsync(id);
        return e is null ? null : new ExpenseDto(e.Id, e.Category, e.Amount, e.Date, e.Description, e.CreatedAt);
    }

    public async Task<ExpenseDto> CreateAsync(string cs, CreateExpenseDto dto)
    {
        var ctx = dbProvider.GetContext(cs);
        var expense = new Expense
        {
            Category = dto.Category,
            Amount = dto.Amount,
            Date = dto.Date,
            Description = dto.Description
        };
        ctx.Expenses.Add(expense);
        await ctx.SaveChangesAsync();
        return new ExpenseDto(expense.Id, expense.Category, expense.Amount, expense.Date, expense.Description, expense.CreatedAt);
    }

    public async Task<ExpenseDto?> UpdateAsync(string cs, int id, UpdateExpenseDto dto)
    {
        var ctx = dbProvider.GetContext(cs);
        var expense = await ctx.Expenses.FindAsync(id);
        if (expense is null) return null;

        expense.Category = dto.Category;
        expense.Amount = dto.Amount;
        expense.Date = dto.Date;
        expense.Description = dto.Description;
        await ctx.SaveChangesAsync();
        return new ExpenseDto(expense.Id, expense.Category, expense.Amount, expense.Date, expense.Description, expense.CreatedAt);
    }

    public async Task<bool> DeleteAsync(string cs, int id)
    {
        var ctx = dbProvider.GetContext(cs);
        var expense = await ctx.Expenses.FindAsync(id);
        if (expense is null) return false;
        ctx.Expenses.Remove(expense);
        await ctx.SaveChangesAsync();
        return true;
    }
}
