using System.Net.Sockets;
using Common;
using Ganss.Xss;
using Microsoft.EntityFrameworkCore;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Polly;
using QuestionService.Data;
using QuestionService.Services;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using Wolverine;
using Wolverine.RabbitMQ;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddProblemDetails(opt => opt.CustomizeProblemDetails = (ctx) =>
{
    ctx.ProblemDetails.Title = ctx.ProblemDetails.Detail;
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.AddServiceDefaults();
builder.Services.AddMemoryCache();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddKeyCloakAuthentication();
builder.Services.AddScoped<HtmlSanitizer>();

builder.AddNpgsqlDbContext<QuestionDbContext>("questionDb");

//improve performance, enable concurrent request
// builder.Services.AddDbContextFactory<QuestionDbContext>(opt =>
// {
//     opt.UseNpgsql(opt.GetConnectionString("questionDb"));
// });

await builder.UseWolverineWithRabbitMqAsync(opt =>
{
    //opt.PublishAllMessages().ToRabbitExchange("questions");
    opt.ApplicationAssembly = typeof(Program).Assembly;
});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapDefaultEndpoints();

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;
try
{
    var context = services.GetRequiredService<QuestionDbContext>();
    await context.Database.MigrateAsync();
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred migrating the database.");
    
}
app.Run();