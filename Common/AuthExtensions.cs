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
                options.TokenValidationParameters = new()
                {
                    ValidIssuers =
                    [
                        "http://localhost:16001/realms/overflow",
                        "http://keycloak/realms/overflow",
                        "http://id.overflow.local/realms/overflow",
                        "https://id.overflow.local/realms/overflow",
                        "https://overflow-id.danqzt.com/realms/overflow",
                    ],
                };
            });
        
        services.AddAuthorizationBuilder();

        return services;
    }
}