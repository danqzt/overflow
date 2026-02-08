using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;

namespace Common;

public static class AuthExtensions
{
    public static IServiceCollection AddKeyCloakAuthentication(this IServiceCollection services)
    {
        services.AddAuthentication()
            .AddKeycloakJwtBearer(serviceName: "keycloak", realm: "overflow", options =>
            {
                options.RequireHttpsMetadata = false;
                options.Audience = "overflow";
                options.IncludeErrorDetails = true;
                options.TokenValidationParameters = new()
                {
                    ValidIssuers =
                    [
                        "http://localhost:16001/realms/overflow",
                        "http://keycloak/realms/overflow",
                        "http://id.overflow.local/realms/overflow",
                        "https://id.overflow.local/realms/overflow",
                        "https://overflow-id.danqzt.com/realms/overflow",
                        "https://keycloak.ashymushroom-163f5ed0.australiaeast.azurecontainerapps.io/realms/overflow",

                    ],
                };
                // options.Events = new JwtBearerEvents
                // {
                //     OnAuthenticationFailed = context =>
                //     {
                //         // This prints the EXACT error (e.g., "IDX10205: Issuer validation failed")
                //         Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                //         Console.WriteLine($"Exception: {context.Exception}");
                //         return Task.CompletedTask;
                //     },
                //     OnForbidden = context =>
                //     {
                //         Console.WriteLine("Forbidden: User is authenticated but lacks required claims/roles.");
                //         return Task.CompletedTask;
                //     },
                //     OnMessageReceived = context => 
                //     {
                //         // Verify the token is actually reaching the service
                //         foreach (var header in context.Request.Headers)
                //         {
                //             Console.WriteLine($"Header: {header.Key} = {header.Value}");
                //         }
                //         return Task.CompletedTask;
                //     }
                // };
            });
        
        services.AddAuthorizationBuilder();

        return services;
    }
}