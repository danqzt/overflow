using System.Security.Claims;
using Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestionService.Data;
using QuestionService.Dto;
using QuestionService.Models;
using QuestionService.Services;
using Wolverine;

namespace QuestionService.Controllers;

[ApiController]
[Route("[controller]")]
public class QuestionsController(QuestionDbContext db, IMessageBus bus, ITagService tagService) : ControllerBase
{
    
    #region Questions CRUD
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Question>> CreateQuestion(CreateQuestionDto dto)
    {
        //validate tags is in Db
        if(await tagService.InValidTags(dto.Tags))
        {
            return BadRequest("One or more tags are invalid.");
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var name = User.FindFirstValue("name");

        if (userId is null || name is null) return BadRequest("Invalid user information.");
        var question = new Question
        {
            Title = dto.Title,
            Content = dto.Content,
            TagSlugs = dto.Tags,
            AskerId = userId,
            AskerDisplayName = name,
        };

        db.Questions.Add(question);
        await db.SaveChangesAsync();
        
        await bus.PublishAsync(new QuestionCreated(
            question.Id,
            question.Title,
            question.Content,
            question.CreatedAt,
            question.TagSlugs
        ));
        return Created($"/questions/{question.Id}", question);
    }

    [HttpGet]
    public async Task<ActionResult<List<Question>>> GetQuestions(string? tag)
    {
        var query = db.Questions
            .Include(a => a.Answers)
            .AsQueryable();

        if (!string.IsNullOrEmpty(tag))
        {
            query = query.Where(q => q.TagSlugs.Contains(tag));
        }

        return await query.OrderByDescending(q => q.CreatedAt).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Question>> GetQuestionById(string id)
    {
        var question = await db.Questions.
             Include(a => a.Answers)
            .Where(q => q.Id == id).FirstOrDefaultAsync();
        
        if (question == null)
        {
            return NotFound();
        }

        //update view count
        await db.Questions.Where(q => q.Id == id)
            .ExecuteUpdateAsync(set => set.SetProperty(q => q.ViewCount, q => q.ViewCount + 1));

        return question;
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateQuestion(string id, CreateQuestionDto dto)
    {
        var question = await db.Questions.FindAsync(id);
        if (question == null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (question.AskerId != userId)
        {
            return Forbid();
        }

        //validate tags is in Db
        if(await tagService.InValidTags(dto.Tags))
        {
            return BadRequest("One or more tags are invalid.");
        }
        

        question.Title = dto.Title;
        question.Content = dto.Content;
        question.TagSlugs = dto.Tags;
        question.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        
        await bus.PublishAsync(new QuestionUpdated(
            question.Id,
            question.Title,
            question.Content,
            question.TagSlugs
        ));
        return NoContent();
    }
    
    
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteQuestion(string id)
    {
        var question = await db.Questions.FindAsync(id);
        if (question == null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (question.AskerId != userId)
        {
            return Forbid();
        }

        db.Questions.Remove(question);
        await db.SaveChangesAsync();
        
        await bus.PublishAsync(new QuestionDeleted( question.Id));
        return NoContent();
    }
    
    #endregion
    
    #region Answers CRUD
    
    [Authorize]
    [HttpPost("{questionId}/answers")]
    public async Task<ActionResult<Answer>> CreateAnswer(string questionId, CreateAnswerDto dto)
    {
        //check if question exists
        var question = await db.Questions.FindAsync(questionId);
        if (question is null)
            return NotFound();
        
        var answer = new Answer
        {
            Content = dto.Content,
            QuestionId = questionId,
            UserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!,
            UserDisplayName = User.FindFirstValue("name")!
        };
        db.Answers.Add(answer);
        question.AnswerCount++;
        
        await db.SaveChangesAsync();
        await bus.PublishAsync(new UpdateAnswerCount(questionId, answer.Question.AnswerCount));
        return Created($"/questions/{questionId}/answers/{answer.Id}", answer);
    }
    
    [Authorize]
    [HttpPut("{questionId}/answers/{answerId}")]
    public async Task<IActionResult> UpdateQuestion(string questionId, string answerId, CreateAnswerDto dto)
    {
        var answer = await db.Answers.FindAsync(answerId);
        if (answer == null || answer.QuestionId != questionId)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (answer.UserId != userId)
        {
            return Forbid();
        }

        answer.Content = dto.Content;
        answer.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return NoContent();
    }
    
    [Authorize]
    [HttpDelete("{questionId}/answers/{answerId}")]
    public async Task<IActionResult> DeleteAnswer(string questionId, string answerId)
    {
        var answer = await db.Answers
            .Include(a => a.Question)
            .FirstOrDefaultAsync(a => a.Id == answerId);
        
        if (answer == null || answer.QuestionId != questionId)
        {
            return NotFound();
        }

        if (answer.Accepted)
        {
            return BadRequest("Cannot delete an accepted answer.");
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (answer.UserId != userId)
        {
            return Forbid();
        }
  
        db.Answers.Remove(answer);
        answer.Question.AnswerCount--;      
        
        await db.SaveChangesAsync();
        await bus.PublishAsync(new UpdateAnswerCount(questionId, answer.Question.AnswerCount));
        return NoContent();
    }
    
    [Authorize]
    [HttpPost("{questionId}/answers/{answerId}/accept")]
    public async Task<IActionResult> AcceptAnswer(string questionId, string answerId)
    {
        var answer = await db.Answers
            .Include(a => a.Question)
            .FirstOrDefaultAsync(a => a.Id == answerId);
        
        if (answer == null || answer.QuestionId != questionId)
        {
            return NotFound();
        }

        if (answer.Question.HasAcceptedAnswer)
        {
            return BadRequest("Question already has an accepted answer.");
        }
        
        answer.Accepted = true;
        answer.Question.HasAcceptedAnswer = true;
        
        await db.SaveChangesAsync();
        await bus.PublishAsync(new AnswerAccepted(questionId));
        return NoContent();
    }
    #endregion
    
}