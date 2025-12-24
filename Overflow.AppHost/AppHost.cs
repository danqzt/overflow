using Projects;

var builder = DistributedApplication.CreateBuilder(args);

//run: dotnet dev-certs https --trust
#pragma warning disable ASPIRECERTIFICATES001
var keycloak = builder.AddKeycloak("keycloak", 16001)
    .WithDataVolume("keycloak-data")
    .WithHttpsDeveloperCertificate();

var questionService = builder.AddProject<QuestionService>("question-svc")
    .WithReference(keycloak)
    .WaitForStart(keycloak);    

builder.Build().Run();