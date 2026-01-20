using Contracts;
using JasperFx.Events;
using Marten;
using Marten.Events.Projections;
using StatService.Models;

namespace StatService.Projections;

public class TopUserProjection : EventProjection
{
    public TopUserProjection() => ProjectAsync<IEvent<UserReputationChanged>>(Apply);

    public static async Task Apply(IEvent<UserReputationChanged> ev, IDocumentOperations ops, CancellationToken ct)
    {
        var day = DateOnly.FromDateTime(ev.Timestamp.UtcDateTime);
        var data = ev.Data;
        var id = $"{data.UserId}:{day:yyyy-MM-dd}";
        var doc = await ops.LoadAsync<UserDailyReputation>(id, ct) ??
                  new UserDailyReputation { Id = id, UserId = data.UserId, Date = day, Delta = 0 };
        doc.Delta += data.Delta;
        ops.Store(doc);
    }
}