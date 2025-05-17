using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YemekTarifiSitesi.API.Data;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;

namespace YemekTarifiSitesi.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CaloriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public CaloriesController(ApplicationDbContext context) => _context = context;

        [HttpGet("{ingredientName}")]
        public async Task<IActionResult> GetCalorie(string ingredientName)
        {
            var cal = await _context.Calories
                .FirstOrDefaultAsync(c => c.IngredientName.ToLower() == ingredientName.ToLower());
            if (cal == null)
                return NotFound();
            return Ok(new { cal.IngredientName, cal.KcalPer100g });
        }

        [HttpGet("meal/{mealName}")]
        public async Task<IActionResult> GetMealCalorie(string mealName)
        {
            if (string.IsNullOrWhiteSpace(mealName))
                return BadRequest("Yemek adı boş olamaz.");

            var normalized = mealName.Trim().ToLower();

            // 1. Doğrudan yemek adı Calories tablosunda var mı?
            var direct = await _context.Calories.FirstOrDefaultAsync(c => c.IngredientName.ToLower() == normalized);
            if (direct != null)
            {
                return Ok(new { mealName = direct.IngredientName, kcalPerPortion = Math.Round(direct.KcalPer100g) });
            }

            // 2. Tarif bul ve malzemeleri topla (eski mantık)
            var recipe = await _context.Recipes.FirstOrDefaultAsync(r => r.Title.ToLower().Contains(normalized));
            if (recipe == null)
                return NotFound(new { message = "Tarif bulunamadı." });

            var caloriesList = await _context.Calories.ToListAsync();
            var ingredients = recipe.Ingredients.Split('\n');
            double totalKcal = 0;
            bool anyFound = false;
            var missing = new List<string>();
            foreach (var ing in ingredients)
            {
                var ingName = ing.Trim().ToLower();
                if (string.IsNullOrWhiteSpace(ingName)) continue;
                // Malzeme adında miktar varsa ayır (örn: "2 su bardağı pirinç")
                var parts = ingName.Split(' ');
                // En uzun eşleşen calorie kaydını bul
                Calorie found = null;
                foreach (var cal in caloriesList)
                {
                    if (ingName.Contains(cal.IngredientName.ToLower()))
                    {
                        found = cal;
                        break;
                    }
                }
                if (found != null)
                {
                    totalKcal += found.KcalPer100g; // Basit: her malzeme için 100g varsayalım
                    anyFound = true;
                }
                else
                {
                    missing.Add(ingName);
                }
            }
            if (!anyFound)
                return NotFound(new { message = "Hiçbir malzeme için kalori bulunamadı." });
            int porsiyon = recipe.Servings > 0 ? recipe.Servings : 1;
            double kcalPerPortion = totalKcal / porsiyon;
            return Ok(new {
                mealName = recipe.Title,
                kcalPerPortion = Math.Round(kcalPerPortion),
                missingIngredients = missing
            });
        }
    }
} 