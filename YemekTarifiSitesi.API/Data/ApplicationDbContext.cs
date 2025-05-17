using Microsoft.EntityFrameworkCore;
using YemekTarifiSitesi.API.Models;

namespace YemekTarifiSitesi.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Rating> Ratings { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<RecipeIngredient> RecipeIngredients { get; set; }
        public DbSet<Calorie> Calories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Recipe tablosu için konfigürasyon
            modelBuilder.Entity<Recipe>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Ingredients).HasMaxLength(2000);
                entity.Property(e => e.Instructions).HasMaxLength(4000);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.YoutubeUrl).HasMaxLength(500);
                entity.Property(e => e.Difficulty).HasMaxLength(50);
                entity.Property(e => e.Cost).HasPrecision(10, 2);
                entity.Property(e => e.Duration).HasDefaultValue(30);
                entity.Property(e => e.Servings).HasDefaultValue(4);
            });

            // Category tablosu için konfigürasyon
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            });

            // Comment tablosu için konfigürasyon
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Content).IsRequired().HasMaxLength(500);
                entity.Property(e => e.UserName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            });

            // Rating tablosu için konfigürasyon
            modelBuilder.Entity<Rating>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Value).IsRequired();
                entity.Property(e => e.UserName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            });

            // Ingredient tablosu için konfigürasyon
            modelBuilder.Entity<Ingredient>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Unit).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Quantity).HasPrecision(10, 2);
            });

            // RecipeIngredient tablosu için konfigürasyon
            modelBuilder.Entity<RecipeIngredient>(entity =>
            {
                entity.HasKey(e => new { e.RecipeId, e.IngredientId });
                entity.Property(e => e.Amount).HasMaxLength(100);
                entity.HasOne(e => e.Recipe)
                      .WithMany(r => r.RecipeIngredients)
                      .HasForeignKey(e => e.RecipeId);
                entity.HasOne(e => e.Ingredient)
                      .WithMany(i => i.RecipeIngredients)
                      .HasForeignKey(e => e.IngredientId);
            });
        }
    }
} 