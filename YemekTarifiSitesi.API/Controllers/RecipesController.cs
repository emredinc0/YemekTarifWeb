using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using YemekTarifiSitesi.API.Data;
using YemekTarifiSitesi.API.Models;

namespace YemekTarifiSitesi.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RecipesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecipeDto>>> GetRecipes()
        {
            var recipes = await _context.Recipes.Include(r => r.Category).ToListAsync();
            return recipes.Select(r => new RecipeDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Ingredients = r.Ingredients,
                Instructions = r.Instructions,
                ImageUrl = r.ImageUrl,
                VideoUrl = r.VideoUrl,
                YoutubeUrl = r.YoutubeUrl,
                IsFeatured = r.IsFeatured,
                ViewCount = r.ViewCount,
                LikeCount = r.LikeCount,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                CategoryId = r.CategoryId,
                Category = new CategoryDto
                {
                    Id = r.Category.Id,
                    Name = r.Category.Name,
                    Description = r.Category.Description
                }
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RecipeDto>> GetRecipe(int id)
        {
            var r = await _context.Recipes.Include(r => r.Category).FirstOrDefaultAsync(r => r.Id == id);
            if (r == null) return NotFound();
            return new RecipeDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Ingredients = r.Ingredients,
                Instructions = r.Instructions,
                ImageUrl = r.ImageUrl,
                VideoUrl = r.VideoUrl,
                YoutubeUrl = r.YoutubeUrl,
                IsFeatured = r.IsFeatured,
                ViewCount = r.ViewCount,
                LikeCount = r.LikeCount,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                CategoryId = r.CategoryId,
                Category = new CategoryDto
                {
                    Id = r.Category.Id,
                    Name = r.Category.Name,
                    Description = r.Category.Description
                }
            };
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<RecipeDto>>> SearchRecipes([FromQuery] string term)
        {
            if (string.IsNullOrWhiteSpace(term))
                return await GetRecipes();
            term = term.ToLower();
            var recipes = await _context.Recipes
                .Include(r => r.Category)
                .Where(r => r.Title.ToLower().Contains(term) ||
                           r.Description.ToLower().Contains(term) ||
                           r.Ingredients.ToLower().Contains(term) ||
                           r.Category.Name.ToLower().Contains(term))
                .ToListAsync();
            return recipes.Select(r => new RecipeDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Ingredients = r.Ingredients,
                Instructions = r.Instructions,
                ImageUrl = r.ImageUrl,
                VideoUrl = r.VideoUrl,
                YoutubeUrl = r.YoutubeUrl,
                IsFeatured = r.IsFeatured,
                ViewCount = r.ViewCount,
                LikeCount = r.LikeCount,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                CategoryId = r.CategoryId,
                Category = new CategoryDto
                {
                    Id = r.Category.Id,
                    Name = r.Category.Name,
                    Description = r.Category.Description
                }
            }).ToList();
        }

        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<RecipeDto>>> GetRecipesByCategory(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
                return await GetRecipes();
            var recipes = await _context.Recipes
                .Include(r => r.Category)
                .Where(r => r.Category.Name == category)
                .ToListAsync();
            return recipes.Select(r => new RecipeDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Ingredients = r.Ingredients,
                Instructions = r.Instructions,
                ImageUrl = r.ImageUrl,
                VideoUrl = r.VideoUrl,
                YoutubeUrl = r.YoutubeUrl,
                IsFeatured = r.IsFeatured,
                ViewCount = r.ViewCount,
                LikeCount = r.LikeCount,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                CategoryId = r.CategoryId,
                Category = new CategoryDto
                {
                    Id = r.Category.Id,
                    Name = r.Category.Name,
                    Description = r.Category.Description
                }
            }).ToList();
        }

        [HttpGet("suggest")]
        public async Task<ActionResult<IEnumerable<RecipeDto>>> SuggestRecipes([FromQuery] string ingredients)
        {
            if (string.IsNullOrWhiteSpace(ingredients))
                return new List<RecipeDto>();

            var ingredientList = ingredients.Split(',')
                .Select(i => i.Trim().ToLower())
                .Where(i => !string.IsNullOrWhiteSpace(i))
                .ToList();

            if (!ingredientList.Any())
                return new List<RecipeDto>();

            var recipes = await _context.Recipes
                .Include(r => r.Category)
                .ToListAsync();

            // Ingredients string'inde arama yap
            var filtered = recipes
                .Where(recipe => ingredientList.All(ingredient =>
                    recipe.Ingredients.ToLower().Contains(ingredient)))
                .ToList();

            return filtered.Select(r => new RecipeDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Ingredients = r.Ingredients,
                Instructions = r.Instructions,
                ImageUrl = r.ImageUrl,
                VideoUrl = r.VideoUrl,
                YoutubeUrl = r.YoutubeUrl,
                IsFeatured = r.IsFeatured,
                ViewCount = r.ViewCount,
                LikeCount = r.LikeCount,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                CategoryId = r.CategoryId,
                Category = new CategoryDto
                {
                    Id = r.Category.Id,
                    Name = r.Category.Name,
                    Description = r.Category.Description
                }
            }).ToList();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRecipe(int id, Recipe recipe)
        {
            if (id != recipe.Id)
            {
                return BadRequest();
            }

            _context.Entry(recipe).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RecipeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<Recipe>> PostRecipe(Recipe recipe)
        {
            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRecipe", new { id = recipe.Id }, recipe);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecipe(int id)
        {
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null)
            {
                return NotFound();
            }

            _context.Recipes.Remove(recipe);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RecipeExists(int id)
        {
            return _context.Recipes.Any(e => e.Id == id);
        }
    }
} 