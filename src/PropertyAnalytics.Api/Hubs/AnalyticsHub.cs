using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace PropertyAnalytics.API.Hubs;

[Authorize]
public class AnalyticsHub : Hub
{
    public async Task JoinProperty(string propertyId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"property-{propertyId}");
    }

    public async Task LeaveProperty(string propertyId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"property-{propertyId}");
    }
}
