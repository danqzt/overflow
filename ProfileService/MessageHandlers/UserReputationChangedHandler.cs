using Contracts;
using Microsoft.EntityFrameworkCore;
using ProfileService.Data;

namespace ProfileService.MessageHandlers;

public class UserReputationChangedHandler(ProfileDbContext db)
{
    public async Task Handle(UserReputationChanged message)
    {
        await db.UserProfiles.Where(x => x.Id == message.UserId)
            .ExecuteUpdateAsync(x => x.SetProperty(p => p.Reputation, p => p.Reputation + message.Delta));
    }
}   