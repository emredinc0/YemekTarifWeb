namespace YemekTarifiSitesi.API.Models
{
    public class CommentDto
    {
        public int Id { get; set; }
        public int RecipeId { get; set; }
        public string? UserName { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
} 