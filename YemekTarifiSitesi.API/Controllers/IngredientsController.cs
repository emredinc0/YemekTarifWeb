using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using YemekTarifiSitesi.API.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace YemekTarifiSitesi.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IngredientsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public IngredientsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var ingredients = _context.Ingredients.ToList();
            return Ok(ingredients);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var ingredient = _context.Ingredients.Find(id);
            if (ingredient == null)
                return NotFound();
            return Ok(ingredient);
        }

        [HttpPost]
        [Authorize]
        public IActionResult Create([FromBody] Ingredient ingredient)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Ingredients.Add(ingredient);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetById), new { id = ingredient.Id }, ingredient);
        }

        [HttpPut("{id}")]
        [Authorize]
        public IActionResult Update(int id, [FromBody] Ingredient ingredient)
        {
            if (id != ingredient.Id)
                return BadRequest();

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Entry(ingredient).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public IActionResult Delete(int id)
        {
            var ingredient = _context.Ingredients.Find(id);
            if (ingredient == null)
                return NotFound();

            _context.Ingredients.Remove(ingredient);
            _context.SaveChanges();
            return NoContent();
        }
    }
} 