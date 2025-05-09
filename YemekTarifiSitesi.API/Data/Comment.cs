using System;

namespace YemekTarifiSitesi.API.Data
{
    public class Comment
    {
        public int Id { get; set; }
        public int RecipeId { get; set; }
        public string? UserName { get; set; } // Anonim için boş olabilir
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public Recipe Recipe { get; set; } = null!;
    }
} 