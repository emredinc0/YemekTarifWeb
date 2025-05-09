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
    public class CommentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public CommentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Belirli bir tarifin yorumlarını getir
        [HttpGet("recipe/{recipeId}")]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetCommentsForRecipe(int recipeId)
        {
            var comments = await _context.Comments
                .Where(c => c.RecipeId == recipeId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
            return comments.Select(c => new CommentDto
            {
                Id = c.Id,
                RecipeId = c.RecipeId,
                UserName = c.UserName,
                Content = c.Content,
                CreatedAt = c.CreatedAt
            }).ToList();
        }

        // Yorum ekle
        [HttpPost]
        public async Task<ActionResult<CommentDto>> AddComment(CommentDto dto)
        {
            var comment = new Comment
            {
                RecipeId = dto.RecipeId,
                UserName = dto.UserName,
                Content = dto.Content,
                CreatedAt = DateTime.Now
            };
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            dto.Id = comment.Id;
            dto.CreatedAt = comment.CreatedAt;
            return CreatedAtAction(nameof(GetCommentsForRecipe), new { recipeId = dto.RecipeId }, dto);
        }
    }
} 