using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeladoriaUrbana.API.Data;
using ZeladoriaUrbana.API.Models;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

app.UseCors("PermitirFrontend");

app.MapGet("/", () => "API online!");

app.MapPost("/api/chamados", async (ApplicationDbContext db, [FromBody] NovoChamadoRequest request) =>
{
    var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Telefone == request.Telefone);

    if (usuario == null)
    {
        usuario = new Usuario
        {
            Nome = request.Nome,
            Telefone = request.Telefone,
            CriadoEm = DateTime.UtcNow
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
        CriadoEm = DateTime.UtcNow,
        HistoricoChat = request.HistoricoChat
    };

    db.Chamados.Add(chamado);
    await db.SaveChangesAsync();

    return Results.Ok(new { 
        mensagem = "Chamado registrado com sucesso!", 
        protocolo = chamado.Protocolo 
    });
});

app.MapGet("/api/chamados", async (ApplicationDbContext db) =>
{
    var chamados = await db.Chamados
        .Include(c => c.Usuario)
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
            historicoChat = c.HistoricoChat
        })
        .ToListAsync();

    return Results.Ok(chamados);
});

app.MapPut("/api/chamados/{protocolo}/status", async (long protocolo, [FromBody] AtualizarStatusRequest request, ApplicationDbContext db) =>
{
    var chamado = await db.Chamados
        .Include(c => c.Usuario)
        .FirstOrDefaultAsync(c => c.Protocolo == protocolo);

    if (chamado == null) return Results.NotFound(new { erro = "Chamado não encontrado." });

    var statusPermitidos = new[] { "Aberto", "Em andamento", "Resolvido" };
    if (!statusPermitidos.Contains(request.Status)) return Results.BadRequest(new { erro = "Status inválido." });

    chamado.Status = request.Status;
    await db.SaveChangesAsync();

    string mensagemNotificacao = request.Status switch
    {
        "Em andamento" => $"*Zeladoria Urbana*\n\nOlá, {chamado.Usuario!.Nome}! O seu chamado *#{protocolo}* referente a '{chamado.Descricao}' agora está *EM ANDAMENTO* pelas nossas equipes. 🚧",
        "Resolvido" => $"*Zeladoria Urbana*\n\nOlá, {chamado.Usuario!.Nome}! Excelente notícia: o seu chamado *#{protocolo}* foi marcado como *RESOLVIDO*. Agradecemos por ajudar a melhorar nossa cidade! ✅",
        _ => $"*Zeladoria Urbana*\n\nOlá, {chamado.Usuario!.Nome}. O status do seu chamado *#{protocolo}* foi atualizado para: {request.Status}."
    };

    try
    {
        using var httpClient = new HttpClient();
        var payload = new
        {
            numero = chamado.Usuario.Telefone,
            mensagem = mensagemNotificacao
        };

        await httpClient.PostAsJsonAsync("http://localhost:3001/send-message", payload);
        Console.WriteLine($"[C#] Requisição de envio disparada para o bot Node.js com sucesso (Protocolo #{protocolo}).");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[C#] Erro ao comunicar com o bot Node.js: {ex.Message}");
    }

    return Results.Ok(new { 
        mensagem = "Status atualizado com sucesso!", 
        novoStatus = chamado.Status 
    });
});

app.Run();

public class NovoChamadoRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string? Endereco { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public string? ImagemUrl { get; set; }
    public string? HistoricoChat { get; set; }
}

public class AtualizarStatusRequest
{
    public string Status { get; set; } = string.Empty;
}