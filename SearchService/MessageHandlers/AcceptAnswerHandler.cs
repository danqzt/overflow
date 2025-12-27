using Contracts;
using Typesense;

namespace SearchService.MessageHandlers;

public class AcceptAnswerHandler(ITypesenseClient client)
{
    public async Task Handle(AnswerAccepted request)
    {
        await client.UpdateDocument("questions", request.QuestionId, new
        {
            HasAcceptedAnswer = true
        });
        Console.WriteLine($"Marked question {request.QuestionId} as having an accepted answer");
    }
}