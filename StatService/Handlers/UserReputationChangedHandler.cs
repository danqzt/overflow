using Contracts;
using Marten;
using Wolverine.Attributes;

namespace StatService.Handlers;

public class UserReputationChangedHandler
{
    [Transactional]
    public static async Task Handle(UserReputationChanged message, IDocumentSession session)
    {
        session.Events.Append(message.UserId, message);
        await session.SaveChangesAsync();
    }
}