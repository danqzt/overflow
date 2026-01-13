using Microsoft.Extensions.Hosting;
using Projects;

var builder = DistributedApplication.CreateBuilder(args);

//aspire publish -o infra
//aspire do prepare-compose --environment staging -o infra
//in infra folder: docker-compose --env-file .env.staging up -d
var compose = builder.AddDockerComposeEnvironment("compose")
    .WithDashboard(d => d.WithHostPort(8080));

//run: dotnet dev-certs https --trust
#pragma warning disable ASPIRECERTIFICATES001
var keycloak = builder.AddKeycloak("keycloak", 16001)
    .WithDataVolume("keycloak-data")
    .WithEnvironment("KC_HTTP_ENABLED", "true")
    .WithEnvironment("KC_HOSTNAME_STRICT", "false")
    .WithRealmImport("../infra/realms")
    .WithEndpoint(16001, 8080, "keycloak-port", isExternal:true)
    .WithEnvironment("VIRTUAL_HOST", "id.overflow.local")
    .WithEnvironment("VIRTUAL_PORT", "8080")
    .WithHttpsDeveloperCertificate();

var postgres = builder.AddPostgres("postgres", port: 5432)
    .WithDataVolume("postgres-data")
    .WithPgWeb();
    //.WithPgAdmin();

var questionDb = postgres.AddDatabase("questionDb");
var profileDb = postgres.AddDatabase("profileDb");

//dotnet user-secrets set "Parameters:typesense-api-key" "<the secret key>"
//dotnet user-secrets list 

var typesenseApiKey = builder.AddParameter("typesense-api-key", secret: true);
var typesenseKey = builder.Environment.IsDevelopment() 
    ? builder.Configuration["Parameters:typesense-api-key"] ?? throw new ArgumentException("Missing parameters:typesense-api-key")
    : "${TYPESENSE_API_KEY}";

//dashboard: https://bfritscher.github.io/typesense-dashboard/#/
var typesense = builder.AddContainer("typesense", "typesense/typesense", "29.0")
    .WithArgs("--data-dir", "/data", "--api-key", typesenseKey, "--enable-cors")
    .WithHttpEndpoint(8108, 8108, name: "typesense")
    .WithEnvironment("TYPESENSE_API_KEY", typesenseKey)
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

var profileService = builder.AddProject<ProfileService>("profile-svc")
    .WithReference(keycloak)
    .WithReference(profileDb)
    .WithReference(rabbitmq)
    .WaitForStart(keycloak)
    .WaitForStart(rabbitmq)
    .WaitForStart(profileDb);

var yarp = builder.AddYarp("gateway")
    .WithConfiguration(c =>
    {
        c.AddRoute("/questions/{**catch-all}", questionService);
        c.AddRoute("/tags/{**catch-all}", questionService);
        c.AddRoute("/search/{**catch-all}", searchService);
        c.AddRoute("/tests/{**catch-all}", questionService);
        c.AddRoute("/profiles/{**catch-all}", profileService);
    })
    .WithEndpoint(18001, 5000, scheme: "http", "gateway-port", isExternal: true)
    .WithEnvironment("VIRTUAL_HOST", "api.overflow.local")
    .WithEnvironment("VIRTUAL_PORT", "5000");

var webapp = builder.AddViteApp(name: "webapp", appDirectory: "../frontend")
    .WithPnpm()
    .WithReference(keycloak)
    .WithEndpoint("http", config => config.Port = 13000)
    .WithEnvironment("VIRTUAL_HOST", "app.overflow.local")
    .WithEnvironment("VIRTUAL_PORT", "13000");


if (!builder.Environment.IsDevelopment())
{
    builder.AddContainer("nginx-proxy", "nginxproxy/nginx-proxy", "1.9")
        .WithEndpoint(80, 80, "nginx", isExternal: true)
        .WithEndpoint(443, 443, "nginx-ssl", isExternal: true)
        .WithBindMount("/var/run/docker.sock", "/tmp/docker.sock", true)
        .WithBindMount("../infra/devcert", "/etc/nginx/certs", true)
        .WithBindMount("../infra/nginx/vhost.d", "/etc/nginx/vhost.d", true);
    
    keycloak.WithEnvironment("KC_HOSTNAME", "https://id.overflow.local")
        .WithEnvironment("KC_HOSTNAME_BACKCHANNEL_DYNAMIC", "true");
    
    webapp.WithEnvironment("API_URL","${API_URL}")
        .WithEnvironment("BETTER_AUTH_SECRET","${BETTER_AUTH_SECRET}")
        .WithEnvironment("CLOUDINARY_API_SECRET","${CLOUDINARY_API_SECRET}")
        .WithEnvironment("AUTH_KEYCLOAK_CLIENT_SECRET","${AUTH_KEYCLOAK_CLIENT_SECRET}")
        .WithEnvironment("AUTH_KEYCLOAK_ISSUER_INTERNAL","${AUTH_KEYCLOAK_ISSUER_INTERNAL}")
        .PublishAsDockerFile();
}
builder.Build().Run();