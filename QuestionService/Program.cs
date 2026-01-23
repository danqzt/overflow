using System.Net.Sockets;
using Common;
using Contracts;
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
using Wolverine.EntityFrameworkCore;
using Wolverine.Postgresql;
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

var connectionString = builder.Configuration.GetConnectionString("questionDb");
builder.Services.AddDbContext<QuestionDbContext>(opt =>
{
    opt.UseNpgsql(connectionString);
}, optionsLifetime: ServiceLifetime.Singleton);

//builder.AddNpgsqlDbContext<QuestionDbContext>("questionDb");

//improve performance, enable concurrent request
// builder.Services.AddDbContextFactory<QuestionDbContext>(opt =>
// {
//     opt.UseNpgsql(opt.GetConnectionString("questionDb"));
// });

await builder.UseWolverineWithRabbitMqAsync(opt =>
{
    //opt.PublishAllMessages().ToRabbitExchange("questions");
    opt.ApplicationAssembly = typeof(Program).Assembly;
    opt.PersistMessagesWithPostgresql(connectionString!);
    opt.UseEntityFrameworkCoreTransactions();
    opt.PublishMessage<QuestionCreated>().ToRabbitExchange("Contracts.QuestionCreated").UseDurableOutbox();
    opt.PublishMessage<QuestionUpdated>().ToRabbitExchange("Contracts.QuestionUpdated").UseDurableOutbox();
    opt.PublishMessage<QuestionDeleted>().ToRabbitExchange("Contracts.QuestionDeleted").UseDurableOutbox();
    
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

await app.MigrateDbContextsAsync<QuestionDbContext>();

app.Run();