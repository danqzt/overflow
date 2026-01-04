using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace QuestionService.Controllers;

[ApiController]
[Route("[controller]")]
public class TestsController : ControllerBase
{
    [HttpGet("errors")]
    public ActionResult GetErrorResponse(int code)
    {
        ModelState.AddModelError("Problem one", "Validation problem one");
        ModelState.AddModelError("Problem two", "Validation problem two");
        return code switch
        {
            400 => BadRequest("Opposite of good request"),
            401 => Unauthorized("Unauthorized"),
            403 => Forbid("Bearer"),
            404 => NotFound("Not Found"),
            500 => throw new Exception("This is server error"),
            _ => ValidationProblem()
        };
    }

    [Authorize]
    [HttpGet("auth")]
    public ActionResult TestAuth()
    {
        var user = User.FindFirstValue("name");
        return Ok(new
        {
            data = $"{user} is authorized",
        });
    }
}