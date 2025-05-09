using System;

namespace YemekTarifiSitesi.API.Data
{
    public class Rating
    {
        public int Id { get; set; }
        public int RecipeId { get; set; }
        public int Value { get; set; } // 1-5 arası
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public Recipe Recipe { get; set; } = null!;
    }
} 