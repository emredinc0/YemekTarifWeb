using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace YemekTarifiSitesi.API.Data
{
    public class Ingredient
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public double Quantity { get; set; }

        public string Unit { get; set; } = string.Empty;

        public bool IsAvailable { get; set; }

        public ICollection<RecipeIngredient> RecipeIngredients { get; set; } = new List<RecipeIngredient>();
    }
} 