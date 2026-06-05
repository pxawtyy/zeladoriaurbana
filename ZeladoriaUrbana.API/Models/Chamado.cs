using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZeladoriaUrbana.API.Models;

[Table("chamados")]
public class Chamado
{
    [Key]
    [Column("protocolo")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Protocolo { get; set; }

    [Required]
    [Column("usuario_id")]
    public Guid UsuarioId { get; set; }

    [Column("endereco")]
    public string? Endereco { get; set; }

    [Required]
    [Column("descricao")]
    public string Descricao { get; set; } = string.Empty;

    [Column("imagem_url")]
    public string? ImagemUrl { get; set; }

    [Required]
    [Column("status")]
    public string Status { get; set; } = "Aberto";

    [Column("criado_em")]
    public DateTime CriadoEm { get; set; }

    public Usuario? Usuario { get; set; }
}