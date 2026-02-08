using Aspire.Hosting.Yarp;
using Microsoft.Extensions.Hosting;
using Overflow.AppHost;
using Projects;

var builder = DistributedApplication.CreateBuilder(args);


var kcPort = builder.ExecutionContext.IsPublishMode ? 80 : 16001;
//run: dotnet dev-certs https --trust
#pragma warning disable ASPIRECERTIFICATES001
var keycloak = builder.AddKeycloak("keycloak")
    .WithEnvironment("KC_HTTP_ENABLED", "true")
    .WithEnvironment("KC_HOSTNAME_STRICT", "false")
    .WithEnvironment("KC_PROXY_HEADERS", "xforwarded")
    .WithEnvironment("KC_HEALTH_ENABLED", "true")
    .WithDataVolume("keycloak-data");

var pgUser = builder.AddParameter("pg-username", secret: false);
var pgPassword = builder.AddParameter("pg-password", secret: true);

var postgres = builder.AddAzurePostgresFlexibleServer("postgres")
    .WithPasswordAuthentication(pgUser, pgPassword);

var questionDb = postgres.AddDatabase("questionDb");
var profileDb = postgres.AddDatabase("profileDb");
var statDb = postgres.AddDatabase("statDb");
var voteDb = postgres.AddDatabase("voteDb");

//dotnet user-secrets set "Parameters:typesense-api-key" "<the secret key>"
//dotnet user-secrets list 

var typesenseApiKey = builder.AddParameter("typesense-api-key", secret: true);
// var typesenseKey = builder.Environment.IsDevelopment() 
//     ? builder.Configuration["Parameters:typesense-api-key"] ?? throw new ArgumentException("Missing parameters:typesense-api-key")
//     : "${TYPESENSE_API_KEY}";

//dashboard: https://bfritscher.github.io/typesense-dashboard/#/
var typesense = builder.AddContainer("typesense", "typesense/typesense", "29.0")
    .WithHttpEndpoint(8108, 8108, name: "typesense")
    .WithEnvironment("TYPESENSE_DATA_DIR", "/data")
    .WithEnvironment("TYPESENSE_API_KEY", typesenseApiKey)
    .WithEnvironment("TYPESENSE_ENABLE_CORS", "true")
    .WithVolume("typesense-data", "/data");

var typesenseContainer = typesense.GetEndpoint("typesense");

var rabbitmq = builder.AddRabbitMQ("messaging")
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

var profileService = builder.AddProject<ProfileService>("profile-svc")
    .WithReference(keycloak)
    .WithReference(profileDb)
    .WithReference(rabbitmq)
    .WaitForStart(keycloak)
    .WaitForStart(rabbitmq)
    .WaitForStart(profileDb);

var statService = builder.AddProject<StatService>("stat-svc")
    .WithReference(statDb)
    .WithReference(rabbitmq)
    .WaitForStart(rabbitmq)
    .WaitForStart(statDb);

var voteService = builder.AddProject<VoteService>("vote-svc")
    .WithReference(keycloak)
    .WithReference(voteDb)
    .WithReference(rabbitmq)
    .WaitForStart(keycloak)
    .WaitForStart(rabbitmq)
    .WaitForStart(voteDb);

var gwPort = builder.ExecutionContext.IsPublishMode ? 80 : 18001;

var yarp = builder.AddYarp("gateway")
    .WithEnvironment("ASPNETCORE_FORWARDEDHEADERS_ENABLED", "true")
    .WithConfiguration(c =>
    {
        c.AddRoute("/questions/{**catch-all}", questionService.GetEndpoint("http"));
        c.AddRoute("/tags/{**catch-all}", questionService.GetEndpoint("http"));
        c.AddRoute("/search/{**catch-all}", searchService.GetEndpoint("http"));
        c.AddRoute("/tests/{**catch-all}", questionService.GetEndpoint("http"));
        c.AddRoute("/profiles/{**catch-all}", profileService.GetEndpoint("http"));
        c.AddRoute("/stats/{**catch-all}", statService.GetEndpoint("http"));
        c.AddRoute("/votes/{**catch-all}", voteService.GetEndpoint("http"));
    });

var webapp = builder.AddViteApp(name: "webapp", appDirectory: "../frontend")
    .WithPnpm()
    .WithReference(keycloak);

if (builder.ExecutionContext.IsPublishMode)
{
    keycloak.WithEndpoint("http", e =>
    {
        e.IsExternal = true;
        e.TargetPort = 8080;
        e.Port = 80;
    });

    var betterAuthSecret = builder.AddParameter("better-auth-secret", secret: true);
    var cloudinarySecret = builder.AddParameter("cloudinary-secret", secret: true);
    var keyCloakSecret = builder.AddParameter("keycloak-secret", secret: true);

    webapp.WithEnvironment("API_URL", yarp.GetEndpoint("http"))
        .WithEnvironment("BETTER_AUTH_SECRET", betterAuthSecret)
        .WithEnvironment("BETTER_AUTH_TRUST_PROXY" , "true")
        .WithEnvironment("CLOUDINARY_API_SECRET", cloudinarySecret)
        .WithEnvironment("AUTH_KEYCLOAK_CLIENT_SECRET", keyCloakSecret)
        .WithEnvironment("AUTH_KEYCLOAK_ISSUER_INTERNAL", $"{keycloak.GetEndpoint("http")}/realms/overflow")
        .PublishAsDockerFile();
    
    rabbitmq.WithVolume("rabbitmq-data", "var/lib/rabbitmq/mnesia");
    webapp.WithEndpoint("http", config =>
    {
        config.Port = 80;
        config.IsExternal = true;
        config.TargetPort = 13000;
    });

    yarp.WithEndpoint(443, 5443, scheme: "https", isExternal: true)
        .WithEndpoint("http", config => {
            config.Port = 80;
            config.TargetPort = 5000;
        });
    
}
else
{
    postgres.RunAsContainer();
    rabbitmq.WithDataVolume("rabbitmq-data");
    webapp.WithEndpoint("http", config => config.Port = 13000);
    keycloak.WithEndpoint(kcPort, 8080, "keycloak-port", isExternal: true)
        .WithHttpsDeveloperCertificate();
    yarp.WithEndpoint(18001, 5000, scheme: "http", "gateway-port", isExternal: true);
}

builder.Build().Run();