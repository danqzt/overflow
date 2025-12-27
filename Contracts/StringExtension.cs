using System.Text.RegularExpressions;

namespace Contracts;

public static class StringExtension
{
    public static string StripHtml(this string input)
    {
        return Regex.Replace(input, "<.*?>", string.Empty);
    }
}