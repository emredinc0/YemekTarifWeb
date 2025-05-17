using System.ComponentModel.DataAnnotations;

namespace YemekTarifiSitesi.API.Models
{
    public class Ingredient
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public decimal Quantity { get; set; }

        [Required]
        public string Unit { get; set; } = string.Empty;

        public bool IsAvailable { get; set; }
    }
} 