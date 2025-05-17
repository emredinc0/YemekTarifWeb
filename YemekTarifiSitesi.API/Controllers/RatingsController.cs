using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using YemekTarifiSitesi.API.Data;
using YemekTarifiSitesi.API.Models;

namespace YemekTarifiSitesi.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public RatingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Belirli bir tarifin tüm puanlarını getir (opsiyonel)
        [HttpGet("recipe/{recipeId}")]
        public async Task<ActionResult<IEnumerable<RatingDto>>> GetRatingsForRecipe(int recipeId)
        {
            var ratings = await _context.Ratings
                .Where(r => r.RecipeId == recipeId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
            return ratings.Select(r => new RatingDto
            {
                Id = r.Id,
                RecipeId = r.RecipeId,
                Value = r.Value,
                UserName = r.UserName,
                CreatedAt = r.CreatedAt
            }).ToList();
        }

        // Ortalama puan ve toplam oy
        [HttpGet("recipe/{recipeId}/average")]
        public async Task<ActionResult<object>> GetAverageRating(int recipeId)
        {
            var ratings = await _context.Ratings.Where(r => r.RecipeId == recipeId).ToListAsync();
            if (!ratings.Any())
                return new { average = 0, count = 0 };
            return new { average = ratings.Average(r => r.Value), count = ratings.Count };
        }

        // Puan ekle
        [HttpPost]
        public async Task<ActionResult<RatingDto>> AddRating(RatingDto dto)
        {
            if (dto.Value < 1 || dto.Value > 5)
                return BadRequest("Puan 1 ile 5 arasında olmalı.");
            var rating = new Rating
            {
                RecipeId = dto.RecipeId,
                Value = dto.Value,
                UserName = dto.UserName,
                CreatedAt = DateTime.Now
            };
            _context.Ratings.Add(rating);
            await _context.SaveChangesAsync();
            dto.Id = rating.Id;
            dto.CreatedAt = rating.CreatedAt;
            return CreatedAtAction(nameof(GetRatingsForRecipe), new { recipeId = dto.RecipeId }, dto);
        }
    }
} 