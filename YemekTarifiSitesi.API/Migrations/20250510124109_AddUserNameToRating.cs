using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YemekTarifiSitesi.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserNameToRating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "Ratings",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserName",
                table: "Ratings");
        }
    }
}
