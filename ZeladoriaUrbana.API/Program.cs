using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZeladoriaUrbana.API.Data;
using ZeladoriaUrbana.API.DTOs;
using ZeladoriaUrbana.API.Models;
using ZeladoriaUrbana.API.Services;

var builder = WebApplication.CreateBuilder(args);

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

builder.Services.AddHttpClient<GroqService>();

var app = builder.Build();

app.UseCors("PermitirFrontend");

app.MapGet("/", () => "API online!");

app.MapPost("/api/chamados", async (ApplicationDbContext db, GroqService groqService, [FromBody] NovoChamadoRequest request) =>
{
    var classificacao = await groqService.ClassificarProblemaAsync(request.Descricao);
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
            historicoChat = c.HistoricoChat,
            categoria = c.Categoria,
            urgencia = c.Urgencia,
            resumoIa = c.ResumoIa
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

    return Results.Ok(new { 
        mensagem = "Status atualizado com sucesso!", 
        novoStatus = chamado.Status 
    });
});

app.Run();