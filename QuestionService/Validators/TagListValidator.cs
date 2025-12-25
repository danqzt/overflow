using System.ComponentModel.DataAnnotations;

namespace QuestionService.Validators;

public class TagListValidator(int max, int min) : ValidationAttribute
{
    public override bool IsValid(object? value)
        => value is List<string> tags && tags.Count >= min && tags.Count <= max;

}