using Projects;

var builder = DistributedApplication.CreateBuilder(args);

//run: dotnet dev-certs https --trust
#pragma warning disable ASPIRECERTIFICATES001
var keycloak = builder.AddKeycloak("keycloak", 16001)
    .WithDataVolume("keycloak-data")
    .WithHttpsDeveloperCertificate();

var postgres = builder.AddPostgres("postgres", port: 5432)
    .WithDataVolume("postgres-data")
    .WithPgAdmin();

var questionDb = postgres.AddDatabase("questionDb");

//dotnet user-secrets set "Parameters:typesense-api-key" "<the secret key>"
//dotnet user-secrets list 
var typesenseApiKey = builder.AddParameter("typesense-api-key", secret: true);

//dashboard: https://bfritscher.github.io/typesense-dashboard/#/
var typesense = builder.AddContainer("typesense", "typesense/typesense", "29.0")
    .WithArgs("--data-dir", "/data", "--api-key", typesenseApiKey, "--enable-cors")
    .WithHttpEndpoint(8108, 8108, name: "typesense")
    .WithVolume("typesense-data", "/data");

var typesenseContainer = typesense.GetEndpoint("typesense");

var rabbitmq = builder.AddRabbitMQ("messaging")
    .WithDataVolume("rabbitmq-data")
    .WithManagementPlugin(port: 15672);

var questionService = builder.AddProject<QuestionService>("question-svc")
    .WithReference(keycloak)
    .WithReference(questionDb)
    .WithReference(rabbitmq)
    .WaitForStart(keycloak)
    .WaitForStart(rabbitmq)
    .WaitForStart(questionDb);

var searchService = builder.AddProject<SearchService>("search-svc")
    .WithReference(typesenseContainer)
    .WithReference(rabbitmq)
    .WithEnvironment("typesense-api-key", typesenseApiKey)
    .WaitForStart(rabbitmq)
    .WaitForStart(typesense);

builder.Build().Run();