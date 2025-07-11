namespace YemekTarifiSitesi.API.Data
{
    public class RecipeIngredient
    {
        public int RecipeId { get; set; }
        public Recipe Recipe { get; set; } = null!;
        public int IngredientId { get; set; }
        public Ingredient Ingredient { get; set; } = null!;
        public string Amount { get; set; } = string.Empty;
    }
} 