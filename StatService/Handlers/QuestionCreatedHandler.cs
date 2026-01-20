using Contracts;
using Marten;
using Wolverine.Attributes;

namespace StatService.Handlers;

public class QuestionCreatedHandler
{
     [Transactional]
     public static async Task Handle(QuestionCreated message, IDocumentSession session, CancellationToken ct)
     {
          session.Events.StartStream(message.QuestionId, message);
          await session.SaveChangesAsync(ct);
     }
}