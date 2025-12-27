using Contracts;
using Typesense;

namespace SearchService.MessageHandlers;

public class QuestionUpdateHandler(ITypesenseClient client)
{
   public async Task Handle(QuestionUpdated message)
   {
       await client.UpdateDocument("questions", message.QuestionId, new
       {
           message.Title, Content = message.Content.StripHtml(), Tags = message.Tags.ToArray()
       });
       Console.WriteLine($"Updated question {message.QuestionId}");
       
   }
}