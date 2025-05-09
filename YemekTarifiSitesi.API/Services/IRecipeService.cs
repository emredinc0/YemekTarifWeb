using System.Collections.Generic;
using System.Threading.Tasks;
using YemekTarifiSitesi.API.Data;

namespace YemekTarifiSitesi.API.Services
{
    public interface IRecipeService
    {
        Task<IEnumerable<Recipe>> GetAllRecipesAsync();
        Task<Recipe> GetRecipeByIdAsync(int id);
        Task<IEnumerable<Recipe>> SearchRecipesAsync(string searchTerm);
        Task<IEnumerable<Recipe>> GetRecipesByCategoryAsync(string category);
        Task<IEnumerable<Recipe>> SuggestRecipesByIngredientsAsync(string ingredients);
    }
} 