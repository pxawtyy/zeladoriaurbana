using Microsoft.EntityFrameworkCore;
using ZeladoriaUrbana.API.Data;
using ZeladoriaUrbana.API.Endpoints;
using ZeladoriaUrbana.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddHttpClient<GroqService>();
builder.Services.AddHttpClient("BotClient", (serviceProvider, client) =>
{
    var botConfig = builder.Configuration.GetSection("BotConfig");
    client.BaseAddress = new Uri(botConfig["BaseUrl"]!);
    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {botConfig["SecretToken"]}");
});

var app = builder.Build();

app.UseCors("PermitirFrontend");

app.MapGet("/", () => "API online!");

app.MapChamadosEndpoints();

app.Run();