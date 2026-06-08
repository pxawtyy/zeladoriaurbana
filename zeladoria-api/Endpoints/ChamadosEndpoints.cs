using Microsoft.EntityFrameworkCore;
using ZeladoriaUrbana.API.Data;
using ZeladoriaUrbana.API.DTOs;
using ZeladoriaUrbana.API.Models;
using ZeladoriaUrbana.API.Services;

namespace ZeladoriaUrbana.API.Endpoints;

public static class ChamadosEndpoints
{
    public static void MapChamadosEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/chamados");

        group.MapPost("/", CriarChamado);
        group.MapGet("/", ListarChamados);
        group.MapPut("/{protocolo}/status", AtualizarStatus);
    }

    private static async Task<IResult> CriarChamado(ApplicationDbContext db, GroqService groq, NovoChamadoRequest request)
    {
        var classificacao = await groq.ClassificarProblemaAsync(request.Descricao);
        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Telefone == request.Telefone);

        if (usuario == null)
        {
            usuario = new Usuario
            {
                Nome = request.Nome,
                Telefone = request.Telefone,
            };
            db.Usuarios.Add(usuario);
            await db.SaveChangesAsync();
        }

        var chamado = new Chamado
        {
            UsuarioId = usuario.Id,
            Descricao = request.Descricao,
            Endereco = request.Endereco,
            ImagemUrl = request.ImagemUrl,
            Status = "Aberto",
            HistoricoChat = request.HistoricoChat,
            Categoria = classificacao?.Categoria ?? "Não classificado",
            Urgencia = classificacao?.Urgencia ?? "Media",
            ResumoIa = classificacao?.Resumo ?? "Resumo indisponível"
        };

        db.Chamados.Add(chamado);
        await db.SaveChangesAsync();

        return Results.Ok(new { 
            mensagem = "Chamado registrado com sucesso!", 
            protocolo = chamado.Protocolo 
        });
    }

    private static async Task<IResult> ListarChamados(ApplicationDbContext db)
    {
        var chamados = await db.Chamados
            .OrderByDescending(c => c.CriadoEm)
            .Select(c => new {
                protocolo = c.Protocolo,
                nomeCidadao = c.Usuario!.Nome,
                telefone = c.Usuario.Telefone,
                endereco = c.Endereco ?? "Não informado",
                descricao = c.Descricao,
                imagemUrl = c.ImagemUrl,
                status = c.Status,
                dataCriacao = c.CriadoEm,
                historicoChat = c.HistoricoChat,
                categoria = c.Categoria,
                urgencia = c.Urgencia,
                resumoIa = c.ResumoIa
            })
            .ToListAsync();

        return Results.Ok(chamados);
    }

    private static async Task<IResult> AtualizarStatus(long protocolo, AtualizarStatusRequest request, ApplicationDbContext db, IHttpClientFactory http)
    {
        var chamado = await db.Chamados
            .Include(c => c.Usuario)
            .FirstOrDefaultAsync(c => c.Protocolo == protocolo);

        if (chamado == null) return Results.NotFound(new { erro = "Chamado não encontrado." });

        var statusPermitidos = new[] { "Aberto", "Em andamento", "Resolvido" };
        if (!statusPermitidos.Contains(request.Status)) return Results.BadRequest(new { erro = "Status inválido." });

        chamado.Status = request.Status;
        await db.SaveChangesAsync();

        try 
        {
            var botClient = http.CreateClient("BotClient");
            
            var payload = new { 
                numero = chamado.Usuario!.Telefone, 
                mensagem = $"*Zeladoria Urbana*\nSeu chamado (Protocolo: {protocolo}) foi atualizado para: *{request.Status}*." 
            };

            await botClient.PostAsJsonAsync("/send-message", payload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AVISO] Erro ao notificar o cidadão: {ex.Message}");
        }

        return Results.Ok(new { mensagem = "Status atualizado com sucesso!" });
    }
}