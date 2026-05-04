namespace PropertyAnalytics.Domain.Entities;

public class UserProperty
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int PropertyId { get; set; }
    public Property Property { get; set; } = null!;

    public string Role { get; set; } = "Owner"; // Owner, Manager, Viewer
}
