namespace ZeladoriaUrbana.API.DTOs;

public class NovoChamadoRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string? Endereco { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public string? ImagemUrl { get; set; }
    public string? HistoricoChat { get; set; }
}