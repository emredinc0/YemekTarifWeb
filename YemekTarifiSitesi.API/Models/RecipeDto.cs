namespace YemekTarifiSitesi.API.Models
{
    public class RecipeDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Ingredients { get; set; } = string.Empty;
        public string Instructions { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string? VideoUrl { get; set; }
        public string? YoutubeUrl { get; set; }
        public bool IsFeatured { get; set; }
        public int ViewCount { get; set; }
        public int LikeCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CategoryId { get; set; }
        public CategoryDto Category { get; set; } = null!;
        public List<CommentDto> Comments { get; set; } = new();
        public List<RatingDto> Ratings { get; set; } = new();
        public string Difficulty { get; set; } = "Kolay";
        public int Duration { get; set; } = 30;
        public decimal Cost { get; set; } = 0;
        public int Servings { get; set; } = 4;
    }

    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
} 