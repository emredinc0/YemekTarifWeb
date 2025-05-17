using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace YemekTarifiSitesi.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly Dictionary<string, string[]> _keywordResponses;
        private readonly string[] _greetings = new[] { "merhaba", "selam", "hey", "alo" };
        private readonly string[] _farewells = new[] { "güle güle", "hoşça kal", "görüşürüz", "bye" };

        public AIController()
        {
            _keywordResponses = new Dictionary<string, string[]>
            {
                {
                    "tarif",
                    new[] {
                        "Size nasıl bir tarif aramak istersiniz? Malzemelerinizi söylerseniz size uygun tarifler önerebilirim.",
                        "Hangi tür yemek tarifi arıyorsunuz? Ana yemek, tatlı veya çorba olabilir.",
                        "Tarif aramak için malzemelerinizi söyleyebilir veya yemek kategorisini belirtebilirsiniz."
                    }
                },
                {
                    "malzeme",
                    new[] {
                        "Hangi malzemeleri kullanmak istiyorsunuz? Size uygun tarifler önerebilirim.",
                        "Malzemelerinizi söylerseniz, onlarla yapabileceğiniz tarifleri bulabilirim.",
                        "Elinizdeki malzemelerle ne yapmak istersiniz? Size yardımcı olabilirim."
                    }
                },
                {
                    "pişirme",
                    new[] {
                        "Pişirme konusunda size nasıl yardımcı olabilirim? Süre, sıcaklık veya teknik hakkında bilgi verebilirim.",
                        "Hangi yemeği pişirmek istiyorsunuz? Size pişirme teknikleri konusunda yardımcı olabilirim.",
                        "Pişirme süresi, sıcaklık ayarı veya özel teknikler hakkında bilgi almak ister misiniz?"
                    }
                },
                {
                    "ikame",
                    new[] {
                        "Hangi malzemenin yerine ne kullanabileceğinizi öğrenmek ister misiniz?",
                        "Malzeme ikamesi konusunda size yardımcı olabilirim. Hangi malzemeyi değiştirmek istiyorsunuz?",
                        "Elinizde olmayan bir malzeme mi var? Size uygun alternatifler önerebilirim."
                    }
                },
                {
                    "ipucu",
                    new[] {
                        "Size özel pişirme ipuçları verebilirim. Hangi konuda yardıma ihtiyacınız var?",
                        "Yemek yaparken kullanabileceğiniz pratik ipuçları paylaşabilirim.",
                        "Pişirme teknikleri, malzeme seçimi veya sunum konusunda ipuçları ister misiniz?"
                    }
                }
            };
        }

        [HttpPost("chat")]
        public IActionResult Chat([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Mesaj boş olamaz.");

            var response = GenerateResponse(request.Message.ToLower());
            return Ok(new { response });
        }

        private string GenerateResponse(string message)
        {
            // Selamlama kontrolü
            if (_greetings.Any(g => message.Contains(g)))
                return "Merhaba! Size nasıl yardımcı olabilirim? Tarif arama, pişirme ipuçları veya malzeme ikameleri konusunda yardımcı olabilirim.";

            // Vedalaşma kontrolü
            if (_farewells.Any(f => message.Contains(f)))
                return "Görüşmek üzere! Başka bir sorunuz olursa yine buradayım.";

            // Anahtar kelime kontrolü
            foreach (var keyword in _keywordResponses.Keys)
            {
                if (message.Contains(keyword))
                {
                    var responses = _keywordResponses[keyword];
                    return responses[new Random().Next(responses.Length)];
                }
            }

            // Genel yanıt
            return "Üzgünüm, bu konuda size yardımcı olamıyorum. Tarifler, pişirme teknikleri, malzeme ikameleri veya pişirme ipuçları hakkında soru sorabilirsiniz.";
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; }
    }
} 