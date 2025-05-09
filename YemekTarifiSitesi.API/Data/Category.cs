using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace YemekTarifiSitesi.API.Data
{
    public class Category
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        public ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
    }
} 