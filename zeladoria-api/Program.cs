using Microsoft.EntityFrameworkCore;
using ZeladoriaUrbana.API.Data;
using ZeladoriaUrbana.API.Endpoints;
using ZeladoriaUrbana.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CORS
// ==========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ==========================================
// 2. BANCO DE DADOS
// ==========================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// ==========================================
// 3. INJEÇÃO DE DEPENDÊNCIA DOS SERVIÇOS
// ==========================================
builder.Services.AddHttpClient<GroqService>();

// Registra um cliente HTTP para comunicação exclusiva com o Bot Node.js
builder.Services.AddHttpClient("BotClient", (serviceProvider, client) =>
{
    var botConfig = builder.Configuration.GetSection("BotConfig");
    client.BaseAddress = new Uri(botConfig["BaseUrl"]!);
    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {botConfig["SecretToken"]}");
});

var app = builder.Build();

// ==========================================
// 4. MIDDLEWARES
// ==========================================
app.UseCors("PermitirFrontend");

// Rota de Health Check
app.MapGet("/", () => "API online!");

// Mapeamento dos endpoints organizados em classes estáticas
app.MapChamadosEndpoints();

app.Run();