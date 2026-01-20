namespace VoteService.Dto;

public record UserVotesResult(
    string TargetId, string TargetType, int VoteValue);