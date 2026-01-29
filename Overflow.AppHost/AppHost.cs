using Microsoft.Extensions.Hosting;
using Projects;

var builder = DistributedApplication.CreateBuilder(args);

var compose = builder.AddDockerComposeEnvironment("overflow")
    .WithSshDeploySupport() //https://github.com/davidfowl/aspire-ssh-deploy/tree/main
    .WithFileTransfer(localPath: "../infra/realms", remotePath: "$HOME/keycloak/realms")
    .WithFileTransfer(localPath: "../infra/nginx/vhost.d", remotePath: "$HOME/nginx")
    .WithFileTransfer(localPath: "../infra/db", remotePath: "$HOME/init.db")
    .WithDashboard(d => d.WithHostPort(8080));

//run: dotnet dev-certs https --trust
#pragma warning disable ASPIRECERTIFICATES001
var keycloak = builder.AddKeycloak("keycloak", 16001)
    .WithDataVolume("keycloak-data")
    .WithEnvironment("KC_HTTP_ENABLED", "true")
    .WithEnvironment("KC_HOSTNAME_STRICT", "false")
    .WithEndpoint(16001, 8080, "keycloak-port", isExternal: true)
    .WithEnvironment("VIRTUAL_HOST", "overflow-id.danqzt.com")
    .WithEnvironment("VIRTUAL_PORT", "8080")
    .WithEnvironment("LETSENCRYPT_HOST", "overflow-id.danqzt.com")
    .WithEnvironment("LETSENCRYPT_EMAIL", "danqzt@hotmail.com")
    .WithHttpsDeveloperCertificate();

var postgres = builder.AddPostgres("postgres", port: 5432)
    .WithDataVolume("postgres-data")
    .WithPgWeb();
//.WithPgAdmin();

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

var yarp = builder.AddYarp("gateway")
    .WithConfiguration(c =>
    {
        c.AddRoute("/questions/{**catch-all}", questionService);
        c.AddRoute("/tags/{**catch-all}", questionService);
        c.AddRoute("/search/{**catch-all}", searchService);
        c.AddRoute("/tests/{**catch-all}", questionService);
        c.AddRoute("/profiles/{**catch-all}", profileService);
        c.AddRoute("/stats/{**catch-all}", statService);
        c.AddRoute("/votes/{**catch-all}", voteService);
    })
    .WithEndpoint(18001, 5000, scheme: "http", "gateway-port", isExternal: true)
    .WithEnvironment("VIRTUAL_HOST", "overflow-api.danqzt.com")
    .WithEnvironment("VIRTUAL_PORT", "5000")
    .WithEnvironment("LETSENCRYPT_HOST", "overflow-api.danqzt.com")
    .WithEnvironment("LETSENCRYPT_EMAIL", "danqzt@hotmail.com");

var webapp = builder.AddViteApp(name: "webapp", appDirectory: "../frontend")
    .WithPnpm()
    .WithReference(keycloak)
    .WithEndpoint("http", config => config.Port = 13000)
    .WithEnvironment("VIRTUAL_HOST", "overflow.danqzt.com")
    .WithEnvironment("LETSENCRYPT_HOST", "overflow.danqzt.com")
    .WithEnvironment("LETSENCRYPT_EMAIL", "danqzt@hotmail.com")
    .WithEnvironment("VIRTUAL_PORT", "13000");

if (builder.Environment.IsDevelopment())
{
    keycloak.WithRealmImport("../infra/realms");
}
else
{
    builder.AddContainer("nginx-proxy", "nginxproxy/nginx-proxy", "1.9")
        .WithEndpoint(80, 80, "nginx", isExternal: true)
        .WithEndpoint(443, 443, "nginx-ssl", isExternal: true)
        .WithBindMount("/var/run/docker.sock", "/tmp/docker.sock", true)
        .WithVolume("certs", "/etc/nginx/certs", false)
        .WithVolume("html", "/usr/share/nginx/html", false)
        .WithVolume("vhost", "/etc/nginx/vhost.d")
        .WithContainerName("nginx-proxy");

    builder.AddContainer("nginx-proxy-acme", "nginxproxy/acme-companion", "2.2")
        .WithEnvironment("DEFAULT_EMAIL", "your-email@address.com")
        .WithEnvironment("NGINX_PROXY_CONTAINER", "nginx-proxy")
        .WithBindMount("/var/run/docker.sock", "/var/run/docker.sock", isReadOnly: true)
        .WithVolume("certs", "/etc/nginx/certs")
        .WithVolume("html", "/usr/share/nginx/html")
        .WithVolume("vhost", "/etc/nginx/vhost.d", false)
        .WithVolume("acme", "/etc/acme.sh");


    keycloak.WithEnvironment("KC_HOSTNAME", "https://overflow-id.danqzt.com")
        .WithBindMount("/home/ubuntu/keycloak/realms", "/opt/keycloak/data/import")
        .WithEnvironment("KC_HOSTNAME_BACKCHANNEL_DYNAMIC", "true");

    postgres.WithBindMount("/home/ubuntu/init.db", "/docker-entrypoint-initdb.d");

    var betterAuthSecret = builder.AddParameter("better-auth-secret", secret: true);
    var cloudinarySecret = builder.AddParameter("cloudinary-secret", secret: true);
    var keyCloakSecret = builder.AddParameter("keycloak-secret", secret: true);

    webapp.WithEnvironment("API_URL", yarp.GetEndpoint("http"))
        .WithEnvironment("BETTER_AUTH_SECRET", betterAuthSecret)
        .WithEnvironment("CLOUDINARY_API_SECRET", cloudinarySecret)
        .WithEnvironment("AUTH_KEYCLOAK_CLIENT_SECRET", keyCloakSecret)
        .WithEnvironment("AUTH_KEYCLOAK_ISSUER_INTERNAL", $"{keycloak.GetEndpoint("http")}/realms/overflow")
        .PublishAsDockerFile();
}

builder.Build().Run();