using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZeladoriaUrbana.API.Models;

[Table("usuarios")]
public class Usuario
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("nome")]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [Column("telefone")]
    public string Telefone { get; set; } = string.Empty;

    [Column("criado_em")]
    public DateTime CriadoEm { get; set; }
}