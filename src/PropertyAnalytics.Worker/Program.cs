using Microsoft.EntityFrameworkCore;
using PropertyAnalytics.Database.Persistence;
using PropertyAnalytics.Database.Services;
using PropertyAnalytics.Worker.Workers;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddDbContext<MasterDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<PropertyDbProviderService>();
builder.Services.AddHostedService<MetricsAggregatorWorker>();

var host = builder.Build();
host.Run();
