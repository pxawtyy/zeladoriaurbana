using Microsoft.EntityFrameworkCore;
using ZeladoriaUrbana.API.Data;
using ZeladoriaUrbana.API.DTOs;
using ZeladoriaUrbana.API.Models;
using ZeladoriaUrbana.API.Services;

namespace ZeladoriaUrbana.API.Endpoints;

/// <summary>
/// Classe estática responsável por concentrar e configurar todas as rotas (Minimal APIs) 
/// referentes à entidade de Chamados.
/// </summary>
public static class ChamadosEndpoints
{
    /// <summary>
    /// Mapeia e agrupa os endpoints RESTful de gerenciamento de chamados sob a rota base '/api/chamados'.
    /// </summary>
    /// <param name="app">O construtor de rotas da aplicação Web.</param>
    public static void MapChamadosEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/chamados");

        group.MapPost("/", CriarChamado);
        group.MapGet("/", ListarChamados);
        group.MapPut("/{protocolo}/status", AtualizarStatus);
    }

    /// <summary>
    /// Recebe o relato do cidadão, utiliza a IA para classificar a ocorrência e persiste o chamado no banco.
    /// Atualiza também o nome do cidadão caso o telefone já exista com outro registro.
    /// </summary>
    /// <param name="db">O contexto de banco de dados injetado por dependência.</param>
    /// <param name="groq">O serviço de IA injetado para realizar a triagem do chamado.</param>
    /// <param name="request">O DTO contendo os dados brutos enviados pelo bot de WhatsApp.</param>
    /// <returns>Um código HTTP 200 OK com o número do protocolo gerado.</returns>
    private static async Task<IResult> CriarChamado(ApplicationDbContext db, GroqService groq, NovoChamadoRequest request)
    {
        var classificacao = await groq.ClassificarProblemaAsync(request.Descricao);
        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Telefone == request.Telefone);

        if (usuario == null)
        {
            usuario = new Usuario {
                Nome = request.Nome,
                Telefone = request.Telefone,
                CriadoEm = DateTime.UtcNow
            };
            db.Usuarios.Add(usuario);
            await db.SaveChangesAsync();
        }
        else
        {
            usuario.Nome = request.Nome; 
            db.Usuarios.Update(usuario);
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

    /// <summary>
    /// Recupera todos os chamados ativos no sistema para a exibição no painel administrativo do Next.js.
    /// </summary>
    /// <param name="db">O contexto de banco de dados.</param>
    /// <returns>Uma lista projetada em DTOs contendo os dados do cidadão e detalhes da ocorrência ordenada pela data.</returns>
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

    /// <summary>
    /// Altera a situação atual de um chamado específico e dispara a notificação via WhatsApp.
    /// </summary>
    /// <param name="protocolo">O identificador sequencial (ID legível) do chamado.</param>
    /// <param name="request">O DTO contendo o novo status a ser aplicado.</param>
    /// <param name="db">O contexto de banco de dados.</param>
    /// <param name="http">A fábrica de clientes HTTP para se comunicar com o microsserviço de mensageria.</param>
    /// <returns>HTTP 200 em caso de sucesso ou HTTP 400/404 em caso de status ou protocolo inválido.</returns>
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