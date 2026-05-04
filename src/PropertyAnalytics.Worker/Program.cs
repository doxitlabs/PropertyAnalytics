using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Infrastructure.Persistence;
using PropertyAnalytics.Infrastructure.Services;
using PropertyAnalytics.Worker.Workers;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddDbContext<MasterDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Master")));

builder.Services.AddSingleton<PropertyDbProviderService>();
builder.Services.AddHostedService<MetricsAggregatorWorker>();

var host = builder.Build();
host.Run();
