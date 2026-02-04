using System.Security.Claims;
using Common;
using Contracts;
using Microsoft.EntityFrameworkCore;
using VoteService.Data;
using VoteService.Dto;
using Wolverine;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.AddServiceDefaults();
builder.Services.AddKeyCloakAuthentication();
await builder.UseWolverineWithRabbitMqAsync(opt => opt.ApplicationAssembly = typeof(Program).Assembly);
builder.AddAzureNpgsqlDbContext<VoteDbContext>("voteDb");
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapPost("/votes", async (CastVoteDto dto, VoteDbContext db, ClaimsPrincipal user, IMessageBus bus) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if(userId is null) return Results.Unauthorized();
    if(dto.TargetType is not ("Question" or "Answer")) 
        return Results.BadRequest("Invalid target type.");
    
    var alreadyVoted = await db.Votes.AnyAsync(v => v.UserId == userId && v.TargetId == dto.TargetId);
    if (alreadyVoted) return Results.BadRequest("Already voted");

    db.Votes.Add(new()
    {
        TargetId = dto.TargetId,
        TargetType = dto.TargetType,
        UserId = userId,
        VoteValue = dto.VoteValue,
        QuestionId = dto.QuestionId
    });

    await db.SaveChangesAsync();

    var reason = (dto.VoteValue, dto.TargetType) switch
    {
        (1, "Question") => ReputationReason.QuestionsUpvoted,
        (1, "Answer") => ReputationReason.AnswerUpvoted,
        (-1, "Answer") => ReputationReason.AnswerDownvoted,
        _ => ReputationReason.QuestionDownvoted
    };
    await bus.PublishAsync(ReputationHelper.MakeEvent(dto.TargetUserId, reason, userId));
    await bus.PublishAsync(new VoteCasted(dto.TargetId, dto.TargetType, dto.VoteValue));
    
    return Results.NoContent();
}).RequireAuthorization();

app.MapGet("/votes/{questionId}", async (string questionId, VoteDbContext db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId is null) return Results.Unauthorized();

    var votes = await db.Votes.Where(v => v.QuestionId == questionId && v.UserId == userId)
        .Select(v => new UserVotesResult(v.TargetId, v.TargetType, v.VoteValue))
        .ToListAsync();
    
    return Results.Ok(votes);
}).RequireAuthorization();

await app.MigrateDbContextsAsync<VoteDbContext>();
app.Run();
