using Contracts;
using Typesense;

namespace SearchService.MessageHandlers;

public class AnswerCountHandler(ITypesenseClient client)
{
    public async Task Handle(UpdateAnswerCount request)
    {
        await client.UpdateDocument("questions", request.QuestionId, new
        {
            AnswerCount = request.AnswerCount
        });
        Console.WriteLine($"Updated answer count for question {request.QuestionId}");
    }
}