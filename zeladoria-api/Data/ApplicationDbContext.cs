using Microsoft.EntityFrameworkCore;
using ZeladoriaUrbana.API.Models;

namespace ZeladoriaUrbana.API.Data;

/// <summary>
/// Contexto de dados principal da aplicação. Responsável por mapear as entidades do sistema 
/// para as tabelas do banco de dados relacional (PostgreSQL/Supabase).
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Chamado> Chamados { get; set; }

    /// <summary>
    /// Sobrescreve a criação do modelo para injetar configurações específicas do banco de dados,
    /// como valores padrão para chaves primárias e datas geradas diretamente no servidor PostgreSQL.
    /// </summary>
    /// <param name="modelBuilder">Construtor de modelos do Entity Framework usado para aplicar as configurações fluentes.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>()
            .Property(u => u.Id)
            .HasDefaultValueSql("uuid_generate_v4()");

        modelBuilder.Entity<Chamado>()
            .Property(c => c.CriadoEm)
            .HasDefaultValueSql("timezone('utc', now())");
            
        base.OnModelCreating(modelBuilder);
    }
}