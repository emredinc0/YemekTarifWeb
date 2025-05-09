using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using YemekTarifiSitesi.API.Data;
using System.Linq;

namespace YemekTarifiSitesi.API.Services
{
    public class RecipeService : IRecipeService
    {
        private readonly ApplicationDbContext _context;

        public RecipeService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Recipe>> GetAllRecipesAsync()
        {
            return await _context.Recipes.Include(r => r.Category).ToListAsync();
        }

        public async Task<Recipe> GetRecipeByIdAsync(int id)
        {
            return await _context.Recipes.Include(r => r.Category).FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Recipe>> SearchRecipesAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllRecipesAsync();

            searchTerm = searchTerm.ToLower();
            return await _context.Recipes
                .Include(r => r.Category)
                .Where(r => r.Title.ToLower().Contains(searchTerm) ||
                           r.Description.ToLower().Contains(searchTerm) ||
                           r.Ingredients.ToLower().Contains(searchTerm) ||
                           r.Category.Name.ToLower().Contains(searchTerm))
                .ToListAsync();
        }

        public async Task<IEnumerable<Recipe>> GetRecipesByCategoryAsync(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
                return await GetAllRecipesAsync();

            return await _context.Recipes
                .Include(r => r.Category)
                .Where(r => r.Category.Name == category)
                .ToListAsync();
        }

        public async Task<IEnumerable<Recipe>> SuggestRecipesByIngredientsAsync(string ingredients)
        {
            if (string.IsNullOrWhiteSpace(ingredients))
                return new List<Recipe>();

            var ingredientList = ingredients.Split(',')
                .Select(i => i.Trim().ToLower())
                .Where(i => !string.IsNullOrWhiteSpace(i))
                .ToList();

            if (!ingredientList.Any())
                return new List<Recipe>();

            var recipes = await _context.Recipes
                .Include(r => r.Category)
                .ToListAsync();

            return recipes
                .Where(recipe => ingredientList.All(ingredient =>
                    recipe.Ingredients.ToLower().Split('\n')
                        .Any(recipeIngredient => recipeIngredient.Trim()
                            .Split(' ')
                            .Any(word => word.Trim() == ingredient))))
                .GroupBy(r => r.Title)
                .Select(g => g.First())
                .ToList();
        }
    }
} 