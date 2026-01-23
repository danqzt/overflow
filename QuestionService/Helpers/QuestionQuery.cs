using Common;

namespace QuestionService.Helpers;

public record QuestionQuery : PaginationRequest
{
    public string? Tag { get; init; }
    public string? Sort { get; init; }
}