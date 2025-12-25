using System.ComponentModel.DataAnnotations;
using QuestionService.Validators;

namespace QuestionService.Dto;

public record CreateQuestionDto(
    [Required] string Title,
    [Required] string Content, 
    [Required] [TagListValidator(5,1)] List<string> Tags);