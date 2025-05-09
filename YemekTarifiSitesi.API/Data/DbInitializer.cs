using System;
using System.Linq;

namespace YemekTarifiSitesi.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Categories.Any())
            {
                return;
            }

            var categories = new Category[]
            {
                new Category { Name = "Yemekler", Description = "Ana yemekler" },
                new Category { Name = "Tatlılar", Description = "Tatlı tarifleri" },
                new Category { Name = "Salatalar", Description = "Salata tarifleri" }
            };

            foreach (var c in categories)
            {
                context.Categories.Add(c);
            }
            context.SaveChanges();

            if (context.Recipes.Any())
            {
                return;
            }

            var yemekler = context.Categories.First(c => c.Name == "Yemekler");
            var tatlilar = context.Categories.First(c => c.Name == "Tatlılar");
            var salatalar = context.Categories.First(c => c.Name == "Salatalar");

            var recipes = new Recipe[]
            {
                new Recipe {
                    Title = "Mercimek Çorbası",
                    Description = "Klasik Türk mutfağının vazgeçilmez çorbası",
                    Ingredients = "1 su bardağı kırmızı mercimek\n1 adet soğan\n1 adet havuç\n2 yemek kaşığı un\n1 yemek kaşığı tereyağı\nTuz, karabiber",
                    Instructions = "1. Mercimekleri yıkayın\n2. Sebzeleri doğrayın\n3. Tencerede tereyağını eritin\n4. Sebzeleri kavurun\n5. Mercimek ve suyu ekleyin\n6. Pişirin ve blenderdan geçirin",
                    ImageUrl = "/img/mercimek-corbasi.jpg",
                    CategoryId = categories.Single(c => c.Name == "Yemekler").Id,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Tavuklu Pilav",
                    Description = "Lezzetli tavuklu pilav tarifi",
                    Ingredients = "2 su bardağı pirinç\n300g tavuk göğsü\n1 adet soğan\n2 yemek kaşığı tereyağı\nTuz, karabiber",
                    Instructions = "1. Pirinci yıkayıp ıslatın\n2. Tavukları kuşbaşı doğrayın\n3. Soğanı yemeklik doğrayın\n4. Tavukları pişirin\n5. Pilavı demleyin",
                    ImageUrl = "/img/tavuklu-pilav.jpg",
                    CategoryId = categories.Single(c => c.Name == "Yemekler").Id,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Çoban Salatası",
                    Description = "Klasik çoban salatası tarifi",
                    Ingredients = "2 adet domates\n2 adet salatalık\n1 adet yeşil biber\n1 adet kuru soğan\nZeytinyağı, Limon",
                    Instructions = "1. Tüm sebzeleri küp küp doğrayın\n2. Zeytinyağı ve limon ekleyin\n3. Tuz ve baharatları ekleyip karıştırın",
                    ImageUrl = "/img/coban-salatasi.jpg",
                    CategoryId = categories.Single(c => c.Name == "Salatalar").Id,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Baklava",
                    Description = "Geleneksel Antep baklavası",
                    Ingredients = "40 adet yufka\n500g ceviz içi\n250g tereyağı\n2 su bardağı şeker\n2 su bardağı su",
                    Instructions = "1. Yufkaları teker teker yağlayın\n2. Cevizleri serpin\n3. Baklava dilimi şeklinde kesin\n4. 180 derecede pişirin\n5. Şerbetini dökün",
                    ImageUrl = "/img/baklava.jpg",
                    CategoryId = categories.Single(c => c.Name == "Tatlılar").Id,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Tantuni",
                    Description = "Mersin usulü tantuni tarifi",
                    CategoryId = yemekler.Id,
                    Ingredients = "Dana eti, Soğan, Maydanoz, Acı biber, Lavaş",
                    Instructions = "1. Eti ince ince doğrayın\n2. Soğan ve maydanozu ekleyin\n3. Lavaşa sarın",
                    ImageUrl = "/img/tantuni.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Şirin",
                    Description = "Geleneksel şirin tarifi",
                    CategoryId = yemekler.Id,
                    Ingredients = "Un, Su, Tuz, Yağ",
                    Instructions = "1. Hamur hazırlayın\n2. Açın\n3. Pişirin",
                    ImageUrl = "/img/sirin.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Bulgur Pilavı",
                    Description = "Lezzetli bulgur pilavı tarifi",
                    CategoryId = yemekler.Id,
                    Ingredients = "Bulgur, Soğan, Domates, Salça, Yağ",
                    Instructions = "1. Soğanları kavurun\n2. Domates ve salçayı ekleyin\n3. Bulguru ekleyip pişirin",
                    ImageUrl = "/img/bulgur-pilavi.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Künefe",
                    Description = "Hatay usulü künefe tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Kadayıf, Peynir, Tereyağı, Şeker, Su",
                    Instructions = "1. Kadayıfı hazırlayın\n2. Peyniri yerleştirin\n3. Pişirin\n4. Şerbetini dökün",
                    ImageUrl = "/img/kunefe.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Sütlaç",
                    Description = "Geleneksel sütlaç tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Pirinç, Süt, Şeker, Nişasta",
                    Instructions = "1. Pirinci pişirin\n2. Süt ve şekeri ekleyin\n3. Nişasta ile kıvam alın",
                    ImageUrl = "/img/sutlac.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Kazandibi",
                    Description = "Geleneksel kazandibi tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Süt, Şeker, Nişasta, Vanilya",
                    Instructions = "1. Sütü kaynatın\n2. Şeker ve nişastayı ekleyin\n3. Karıştırarak pişirin",
                    ImageUrl = "/img/kazandibi.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Güllaç",
                    Description = "Ramazan tatlısı güllaç tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Güllaç yaprağı, Süt, Şeker, Ceviz",
                    Instructions = "1. Sütü şekerle kaynatın\n2. Yaprakları ıslatın\n3. Ceviz serpin",
                    ImageUrl = "/img/gullac.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Şekerpare",
                    Description = "Geleneksel şekerpare tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Un, Tereyağı, Şeker, Yumurta",
                    Instructions = "1. Hamur hazırlayın\n2. Şekillendirin\n3. Pişirin\n4. Şerbetini dökün",
                    ImageUrl = "/img/sekerpare.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Revani",
                    Description = "Geleneksel revani tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Un, Yumurta, Şeker, Süt",
                    Instructions = "1. Hamur hazırlayın\n2. Pişirin\n3. Şerbetini dökün",
                    ImageUrl = "/img/revani.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "İrmik Helvası",
                    Description = "Geleneksel irmik helvası tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "İrmik, Tereyağı, Şeker, Süt",
                    Instructions = "1. İrmiği kavurun\n2. Süt ve şekeri ekleyin\n3. Pişirin",
                    ImageUrl = "/img/irmik-helvasi.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Aşure",
                    Description = "Geleneksel aşure tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Buğday, Kuru fasulye, Nohut, Kuru üzüm, Ceviz",
                    Instructions = "1. Buğdayı pişirin\n2. Diğer malzemeleri ekleyin\n3. Pişirin",
                    ImageUrl = "/img/asure.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Lokma",
                    Description = "Geleneksel lokma tatlısı tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Un, Maya, Şeker, Yağ",
                    Instructions = "1. Hamur hazırlayın\n2. Kızartın\n3. Şerbetini dökün",
                    ImageUrl = "/img/lokma.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Fırın Helva",
                    Description = "Geleneksel fırın helvası tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Un, Tereyağı, Şeker, Süt",
                    Instructions = "1. Unu kavurun\n2. Süt ve şekeri ekleyin\n3. Fırında pişirin",
                    ImageUrl = "/img/firin-helva.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Ayva Tatlısı",
                    Description = "Geleneksel ayva tatlısı tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Ayva, Şeker, Karanfil",
                    Instructions = "1. Ayvaları hazırlayın\n2. Şekerle pişirin\n3. Karanfil ekleyin",
                    ImageUrl = "/img/ayva-tatlisi.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Trileçe",
                    Description = "Özel trileçe tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Süt, Krema, Şeker, Kakao",
                    Instructions = "1. Keki pişirin\n2. Sütlü karışımı hazırlayın\n3. Üzerine karamel dökün",
                    ImageUrl = "/img/trilece.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Magnolia",
                    Description = "Özel magnolia tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Süt, Krema, Bisküvi, Muz",
                    Instructions = "1. Krema hazırlayın\n2. Bisküvileri dizin\n3. Muz ekleyin",
                    ImageUrl = "/img/magnolia.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Cheesecake",
                    Description = "Özel cheesecake tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Peynir, Krema, Bisküvi, Şeker",
                    Instructions = "1. Tabanı hazırlayın\n2. Peynirli karışımı yapın\n3. Pişirin",
                    ImageUrl = "/img/cheesecake.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Tiramisu",
                    Description = "İtalyan usulü tiramisu tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Mascarpone, Kahve, Bisküvi, Kakao",
                    Instructions = "1. Kahveyi hazırlayın\n2. Kremayı yapın\n3. Katmanları dizin",
                    ImageUrl = "/img/tiramisu.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Profiterol",
                    Description = "Özel profiterol tarifi",
                    CategoryId = tatlilar.Id,
                    Ingredients = "Un, Tereyağı, Yumurta, Çikolata",
                    Instructions = "1. Hamur hazırlayın\n2. Pişirin\n3. Kremayı doldurun\n4. Çikolata sosu dökün",
                    ImageUrl = "/img/profiterol.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Mevsim Salata",
                    Description = "Taze mevsim salatası tarifi",
                    CategoryId = salatalar.Id,
                    Ingredients = "Marul, Domates, Salatalık, Mısır, Zeytinyağı",
                    Instructions = "1. Sebzeleri doğrayın\n2. Mısır ekleyin\n3. Sosu dökün",
                    ImageUrl = "/img/mevsim-salata.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Akdeniz Salatası",
                    Description = "Akdeniz usulü salata tarifi",
                    CategoryId = salatalar.Id,
                    Ingredients = "Marul, Ton balığı, Zeytin, Domates, Salatalık",
                    Instructions = "1. Sebzeleri doğrayın\n2. Ton balığı ekleyin\n3. Zeytinleri ekleyin",
                    ImageUrl = "/img/akdeniz-salatasi.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Sezar Salata",
                    Description = "Tavuklu Sezar salata tarifi",
                    CategoryId = salatalar.Id,
                    Ingredients = "Marul, Tavuk göğsü, Kruton, Parmesan peyniri, Sezar sosu",
                    Instructions = "1. Tavuğu pişirin\n2. Marulu doğrayın\n3. Malzemeleri karıştırın\n4. Sosu ekleyin",
                    ImageUrl = "/img/sezar-salata.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Roka Salatası",
                    Description = "Roka salatası tarifi",
                    CategoryId = salatalar.Id,
                    Ingredients = "Roka, Domates, Parmesan peyniri, Zeytinyağı, Limon",
                    Instructions = "1. Rokayı yıkayın\n2. Domatesleri ekleyin\n3. Peynir ve sosu ekleyin",
                    ImageUrl = "/img/roka-salatasi.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Kısır",
                    Description = "Geleneksel kısır tarifi",
                    CategoryId = salatalar.Id,
                    Ingredients = "Bulgur, Domates salçası, Maydanoz, Soğan, Limon",
                    Instructions = "1. Bulguru ıslatın\n2. Malzemeleri ekleyin\n3. Karıştırın",
                    ImageUrl = "/img/kisir.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Mercimek Köftesi",
                    Description = "Geleneksel mercimek köftesi tarifi",
                    CategoryId = salatalar.Id,
                    Ingredients = "Kırmızı mercimek, Bulgur, Soğan, Maydanoz, Baharatlar",
                    Instructions = "1. Mercimeği pişirin\n2. Bulgur ekleyin\n3. Malzemeleri karıştırın",
                    ImageUrl = "/img/mercimek-koftesi.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Patlıcan Salatası",
                    Description = "Geleneksel patlıcan salatası tarifi",
                    CategoryId = salatalar.Id,
                    Ingredients = "Patlıcan, Sarımsak, Zeytinyağı, Limon",
                    Instructions = "1. Patlıcanları közleyin\n2. Kabuklarını soyun\n3. Malzemeleri karıştırın",
                    ImageUrl = "/img/patlican-salatasi.jpg",
                    CreatedAt = DateTime.Now
                },
                new Recipe {
                    Title = "Ton Balıklı Salata",
                    Description = "Ton balıklı salata tarifi",
                    CategoryId = salatalar.Id,
                    Ingredients = "Ton balığı, Mısır, Marul, Domates, Salatalık",
                    Instructions = "1. Sebzeleri doğrayın\n2. Ton balığı ekleyin\n3. Mısır ekleyin",
                    ImageUrl = "/img/ton-balikli-salata.jpg",
                    CreatedAt = DateTime.Now
                }
            };

            foreach (var r in recipes)
            {
                context.Recipes.Add(r);
            }
            context.SaveChanges();
        }
    }
} 