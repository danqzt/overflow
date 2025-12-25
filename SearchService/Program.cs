using SearchService.Data;
using Typesense;
using Typesense.Setup;

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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

//Create index if not exists
using var scope = app.Services.CreateScope();
var client = scope.ServiceProvider.GetRequiredService<ITypesenseClient>();
await SearchInitializer.EnsureIndexExists(client);

app.MapDefaultEndpoints();
app.Run();
