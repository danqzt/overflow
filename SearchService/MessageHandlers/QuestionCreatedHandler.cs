using System.Text.RegularExpressions;
using Contracts;
using SearchService.Models;
using Typesense;

namespace SearchService.MessageHandlers;

public class QuestionCreatedHandler(ITypesenseClient client)
{
    public async Task Handle(QuestionCreated message)
    {
        var created = new DateTimeOffset(message.Created).ToUnixTimeSeconds();
        var document = new SearchQuestion
        {
            Id = message.QuestionId,
            Title = message.Title,
            Content = message.Content.StripHtml(),
            CreatedAt = created,
            Tags = message.Tags.ToArray()
        };

        await client.CreateDocument("questions", document);
        Console.WriteLine($"Created question {message.QuestionId}");
        
        string StripHtml(string input)
        {
            return Regex.Replace(input, "<.*?>", string.Empty);
        }
    }
}