using System.Text.RegularExpressions;
using Common;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using SearchService.Data;
using SearchService.Models;
using Typesense;
using Typesense.Setup;
using Wolverine;
using Wolverine.RabbitMQ;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.AddServiceDefaults();
var typesenseUri = builder.Configuration["TYPESENSE_TYPESENSE"];
var typesenseApiKey = builder.Configuration["typesense-api-key"];

if(string.IsNullOrWhiteSpace(typesenseUri) || string.IsNullOrWhiteSpace(typesenseApiKey))
    throw new InvalidOperationException($"The typesense configuration is invalid.");

var uri = new Uri(typesenseUri!);
builder.Services.AddTypesenseClient(c =>
{
    c.ApiKey = typesenseApiKey;
    c.Nodes = new List<Node>()
    {
        new(uri.Host, uri.Port.ToString(), uri.Scheme)
    };
});

await builder.UseWolverineWithRabbitMqAsync(opts =>
{
    opts.ListenToRabbitQueue("questions.search", x => x.BindExchange("questions"));
    opts.ApplicationAssembly = typeof(Program).Assembly;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapDefaultEndpoints();
app.MapGet("/search", async (string query, ITypesenseClient client) =>
{
    string? tag = null;
    var tagMatch = Regex.Match(query, @"\[(.*?)\]");
    if (tagMatch.Success)
    {
        tag = tagMatch.Groups[1].Value;
        query = query.Replace(tagMatch.Value, string.Empty).Trim();
    }

    var searchParams = new SearchParameters(query, "title,content");
    if (!string.IsNullOrWhiteSpace(tag))
    {
        searchParams.FilterBy = $"tags:=[{tag}]";;
    }

    try
    {
        var result = await client.Search<SearchQuestion>("questions", searchParams);
        return Results.Ok(result.Hits.Select(h => h.Document));
    }
    catch (Exception ex)
    {
        return Results.Problem($"An error occurred while searching: {ex.Message}");
    }
});
app.MapGet("/search/similar-titles", async (string query, ITypesenseClient client) =>
{
    var searchParams = new SearchParameters(query, "title");
    try
    {
        var result = await client.Search<SearchQuestion>("questions", searchParams);
        return Results.Ok(result.Hits.Select(h => h.Document));
    }
    catch (Exception ex)
    {
        return Results.Problem($"An error occurred while searching: {ex.Message}");
    }
});

//Create index if not exists
using var scope = app.Services.CreateScope();
var client = scope.ServiceProvider.GetRequiredService<ITypesenseClient>();
await SearchInitializer.EnsureIndexExists(client);

app.Run();
