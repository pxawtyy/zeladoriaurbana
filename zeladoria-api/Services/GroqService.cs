using System.Net.Http.Headers;
using System.Text.Json;
using ZeladoriaUrbana.API.Models;

namespace ZeladoriaUrbana.API.Services;

/// <summary>
/// Serviço dedicado à integração com a API da Groq. 
/// Utiliza o modelo LLaMA 3 para processar o processamento de linguagem natural (NLP).
/// </summary>
public class GroqService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public GroqService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _config["GroqApiKey"]);
    }

    /// <summary>
    /// Analisa a descrição enviada pelo cidadão e utiliza inteligência artificial para inferir 
    /// a categoria do problema, o nível de urgência e gerar um resumo conciso.
    /// </summary>
    /// <param name="descricao">O relato textual completo fornecido pelo usuário via WhatsApp ou plataforma.</param>
    /// <returns>Um objeto <see cref="IaClassificacao"/> contendo Categoria, Urgencia e Resumo estruturados, ou nulo em caso de falha na IA.</returns>
    public async Task<IaClassificacao?> ClassificarProblemaAsync(string descricao)
    {
        var systemPrompt = "Você é um classificador de zeladoria urbana. Analise a descrição e retorne ESTRITAMENTE um objeto JSON válido, sem markdown ou texto extra, com as chaves: 'categoria' (ex: Iluminação, Asfalto, Lixo, Água), 'urgencia' (somente Alta, Media ou Baixa baseada no risco ao cidadão) e 'resumo' (uma frase curta de até 10 palavras resumindo o problema).";

        var requestBody = new
        {
            model = "llama-3.1-8b-instant",
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = descricao }
            },
            response_format = new { type = "json_object" }
        };

        var response = await _httpClient.PostAsJsonAsync("https://api.groq.com/openai/v1/chat/completions", requestBody);
        var responseData = await response.Content.ReadFromJsonAsync<GroqResponse>();
        
        var jsonContent = responseData?.Choices.FirstOrDefault()?.Message.Content ?? "{}";
        return JsonSerializer.Deserialize<IaClassificacao>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }
}