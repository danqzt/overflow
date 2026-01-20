using Common;
using Contracts;
using JasperFx.Events;
using JasperFx.Events.Projections;
using Marten;
using StatService.Models;
using StatService.Projections;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.AddServiceDefaults();
await builder.UseWolverineWithRabbitMqAsync(opts =>
{
    opts.ApplicationAssembly = typeof(Program).Assembly;
});

builder.Services.AddMarten(opts =>
{
   opts.Connection(builder.Configuration.GetConnectionString("statDb")!);
   opts.Events.StreamIdentity = StreamIdentity.AsString;
   opts.Events.AddEventType<QuestionCreated>();
   opts.Events.AddEventType<UserReputationChanged>();

   opts.Schema.For<TagDailyUsage>()
       .Index(x => x.Tag)
       .Index(x => x.Date);
   
   opts.Schema.For<UserDailyReputation>()
       .Index(x => x.UserId)
       .Index(x => x.Date);
   
   opts.Projections.Add(new TrendingTagsProjection(), ProjectionLifecycle.Inline);
   opts.Projections.Add(new TopUserProjection(), ProjectionLifecycle.Inline);

}).UseLightweightSessions();

var app = builder.Build();

app.MapGet("/stats/trending-tags", async (IQuerySession session) =>
{
    var today = DateOnly.FromDateTime(DateTime.UtcNow);
    var start = today.AddDays(-6);
    var rows = await session.Query<TagDailyUsage>()
        .Where(x => x.Date >= start && x.Date <= today)
        .Select(x => new { x.Tag, x.Count })
        .ToListAsync();
    
    var top = rows.GroupBy(x => x.Tag)
        .Select(s => new { Tag = s.Key, Count = s.Sum(x => x.Count) })
        .OrderByDescending(x => x.Count).Take(5).ToList();

    return Results.Ok(top);
});

app.MapGet("/stats/top-users", async (IQuerySession session) =>
{
    var today = DateOnly.FromDateTime(DateTime.UtcNow);
    var start = today.AddDays(-6);
    var rows = await session.Query<UserDailyReputation>()
        .Where(x => x.Date >= start && x.Date <= today)
        .Select(x => new { x.UserId, x.Delta })
        .ToListAsync();
    
    var top = rows.GroupBy(x => x.UserId)
        .Select(s => new { UserId = s.Key, Delta = s.Sum(x => x.Delta) })
        .OrderByDescending(x => x.Delta).Take(5).ToList();

    return Results.Ok(top);
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.Run();

