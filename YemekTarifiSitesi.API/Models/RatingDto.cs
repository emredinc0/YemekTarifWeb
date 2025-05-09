namespace YemekTarifiSitesi.API.Models
{
    public class RatingDto
    {
        public int Id { get; set; }
        public int RecipeId { get; set; }
        public int Value { get; set; }
        public DateTime CreatedAt { get; set; }
    }
} 