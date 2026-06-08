# 🏙️ Zeladoria Urbana - Sistema Integrado de Gestão

Um ecossistema completo para gestão de zeladoria urbana, conectando a população ao poder público através de inteligência artificial, automação e atualizações em tempo real.

## 🚀 O Projeto

O projeto resolve o problema da lentidão e da falta de transparência no reporte de problemas da infraestrutura da cidade (buracos, iluminação, lixo, etc.). O cidadão relata o problema de forma intuitiva via assistente virtual, uma IA classifica a urgência automaticamente, e a gestão pública possui um painel em tempo real para monitorar e atualizar o status das ocorrências. A cada mudança de status, o cidadão é notificado ativamente via WhatsApp.

## 🏗️ Arquitetura e Tecnologias

O projeto adota uma arquitetura orientada a eventos e microsserviços (gerenciada via monorepo com `pnpm workspace`), garantindo escalabilidade e separação de responsabilidades:

* **Frontend (Painel e Landing Page):** [Next.js](https://nextjs.org/) + React + TailwindCSS.
* **API Principal:** [C# / .NET 8](https://dotnet.microsoft.com/) configurado com Minimal APIs, DTOs e injeção de dependência.
* **Banco de Dados & Realtime:** [Supabase](https://supabase.com/) (PostgreSQL) utilizando WebSockets para atualizações instantâneas no front-end e Webhooks para gatilhos direto no banco.
* **Inteligência Artificial:** [Groq API](https://groq.com/) (LLaMA 3) para classificação automática de urgência, categoria e geração de resumos.
* **Automação e Orquestração:** [n8n](https://n8n.io/) rodando via Docker para interceptar Webhooks e gerenciar o fluxo de dados assíncrono.
* **Mensageria:** Microsserviço em [Node.js](https://nodejs.org/) (Express + Baileys) dedicado ao disparo de notificações via WhatsApp.

## ✨ Funcionalidades Principais

* **Chatbot de Triagem:** Interface amigável para o cidadão relatar problemas, com suporte a anexo de imagens nativas.
* **Classificação por IA:** Todo chamado recebe uma *tag* de urgência, categoria e um resumo gerados via IA, otimizando o tempo de triagem manual dos servidores.
* **Painel Administrativo Realtime:** A interface recebe novos protocolos e mudanças de status instantaneamente, sem necessidade de recarregar a página.
* **Notificações Ativas:** O cidadão é avisado automaticamente no WhatsApp sempre que as equipes alterarem o status do protocolo.

## ⚙️ Como Executar Localmente

### Pré-requisitos

* [Node.js](https://nodejs.org/) v18+ e [PNPM](https://pnpm.io/)
* [.NET SDK](https://dotnet.microsoft.com/download) 8.0+
* [Docker Desktop](https://www.docker.com/products/docker-desktop) com virtualização ativada.
* [Ngrok](https://ngrok.com/) para tunelamento local.
* Projetos configurados no [Supabase](https://supabase.com/) e [Groq](https://groq.com/).

### Passo a Passo

## 1. Orquestração (n8n)

```bash
cd n8n-local
docker compose up -d
```

*Abra o n8n no `localhost:5678`, ative o túnel do Ngrok e configure o Webhook de produção no Supabase.*

## 2. API Backend (C#)

```bash
cd zeladoria-api

# Lembre-se de configurar a connection string e a
# API Key da Groq via User Secrets ou appsettings.json,
# bem como as variáveis do bot de WhatsApp

dotnet run
```

## 3. Microsserviço de Mensageria (Bot WhatsApp)

```bash
cd zeladoria-whatsapp
pnpm install
pnpm start
```

*Insira o código de pareamento gerado no terminal em: WhatsApp -> Dispositivos Conectados -> Conectar com número de telefone.*

## 4. Frontend (Next.js)

```bash
cd zeladoria-front
pnpm install

# Configure as variáveis de ambiente locais

pnpm dev
```

*Acesse o portal do cidadão e painel de gestão em [http://localhost:3000](http://localhost:3000).*

---

## 👨‍💻 Autor

**Michael Akira de Lima Kuwahara**
Estudante de **Desenvolvimento de Software Multiplataforma** na **Fatec Luigi Papaiz**.
