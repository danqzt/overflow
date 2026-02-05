namespace Overflow.AppHost;

#pragma warning disable ASPIREPROBES001
public static class ProbeExtensions
{
    public static IResourceBuilder<T> WithHealthProbe<T>(
        this IResourceBuilder<T> builder, 
        string healthPath = "/health",
        string alivePath = "/alive") 
        where T : IResourceWithEndpoints, IResourceWithProbes
    {
        return builder
            .WithHttpProbe(ProbeType.Startup, healthPath, initialDelaySeconds: 15, timeoutSeconds: 5)
            .WithHttpProbe(ProbeType.Readiness, healthPath, timeoutSeconds: 3)
            .WithHttpProbe(ProbeType.Liveness, alivePath, periodSeconds: 30, timeoutSeconds: 5);
    }
}