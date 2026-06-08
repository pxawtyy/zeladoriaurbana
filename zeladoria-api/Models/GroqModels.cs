using System.Text.Json.Serialization;

namespace ZeladoriaUrbana.API.Models;

public class GroqResponse
{
    public List<GroqChoice> Choices { get; set; } = new();
}

public class GroqChoice
{
    public GroqMessage Message { get; set; } = new();
}

public class GroqMessage
{
    public string Content { get; set; } = string.Empty;
}

public class IaClassificacao
{
    public string Categoria { get; set; } = string.Empty;
    public string Urgencia { get; set; } = string.Empty;
    public string Resumo { get; set; } = string.Empty;
}