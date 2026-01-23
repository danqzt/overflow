using System.Security.Claims;
using Common;
using Microsoft.EntityFrameworkCore;
using ProfileService.Data;
using ProfileService.Dto;
using ProfileService.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.AddServiceDefaults();
builder.Services.AddKeyCloakAuthentication();
builder.AddNpgsqlDbContext<ProfileDbContext>("profileDb");
await builder.UseWolverineWithRabbitMqAsync(opt =>
{
    opt.ApplicationAssembly = typeof(Program).Assembly;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseMiddleware<UserProfileCreationMiddleware>();

app.MapGet(("/profiles/me"), async (ClaimsPrincipal user, ProfileDbContext db) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId == null) return Results.Unauthorized();
    
    var profile = await db.UserProfiles.FindAsync(userId);
    return profile == null ?  Results.NotFound() : Results.Ok(profile);
}).RequireAuthorization();

app.MapGet("/profiles/batch", async (string ids, ProfileDbContext db) =>
{
    var list = ids.Split(",", StringSplitOptions.RemoveEmptyEntries).Distinct().ToList();

    var rows = await db.UserProfiles
        .Where(p => list.Contains(p.Id))
        .Select(x => new ProfileSummaryDto(x.Id, x.DisplayName, x.Reputation))
        .ToListAsync();

    return Results.Json(rows);
});

await app.MigrateDbContextsAsync<ProfileDbContext>();


app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}