using Microsoft.EntityFrameworkCore;
using ZeladoriaUrbana.API.Models;

namespace ZeladoriaUrbana.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Chamado> Chamados { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>()
            .Property(u => u.Id)
            .HasDefaultValueSql("uuid_generate_v4()");

        modelBuilder.Entity<Chamado>()
            .Property(c => c.CriadoEm)
            .HasDefaultValueSql("NOW()");
            
        base.OnModelCreating(modelBuilder);
    }
}