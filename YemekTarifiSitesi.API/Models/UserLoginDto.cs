namespace YemekTarifiSitesi.API.Models
{
    public class UserLoginDto
    {
        public string EmailOrUserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
} 