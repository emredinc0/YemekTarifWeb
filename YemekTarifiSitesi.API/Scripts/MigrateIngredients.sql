-- Önce mevcut malzemeleri temizleyelim (eğer varsa)
IF EXISTS (SELECT * FROM RecipeIngredients)
BEGIN
    DELETE FROM RecipeIngredients;
END

IF EXISTS (SELECT * FROM Ingredients)
BEGIN
    DELETE FROM Ingredients;
END

-- Recipes tablosundaki malzemeleri alıp Ingredients tablosuna ekleyelim
-- Sadece okuma yapıyoruz, Recipes tablosuna yazma yapmıyoruz
INSERT INTO Ingredients (Name, Unit)
SELECT DISTINCT 
    TRIM(REPLACE(REPLACE(REPLACE(value, '-', ''), '\n', ''), '\r', '')) as Name,
    'adet' as Unit
FROM (
    -- Sadece malzemeleri okuyoruz, değiştirmiyoruz
    SELECT Ingredients FROM Recipes
) AS R
CROSS APPLY STRING_SPLIT(REPLACE(REPLACE(Ingredients, '\n', ','), '\r', ''), ',')
WHERE TRIM(REPLACE(REPLACE(REPLACE(value, '-', ''), '\n', ''), '\r', '')) != ''
AND LEN(TRIM(REPLACE(REPLACE(REPLACE(value, '-', ''), '\n', ''), '\r', ''))) <= 100
AND NOT EXISTS (
    SELECT 1 FROM Ingredients i 
    WHERE i.Name = TRIM(REPLACE(REPLACE(REPLACE(value, '-', ''), '\n', ''), '\r', ''))
);

-- RecipeIngredients tablosunu dolduralım
-- Sadece okuma yapıyoruz, Recipes tablosuna yazma yapmıyoruz
WITH UniqueIngredients AS (
    SELECT DISTINCT
        r.Id as RecipeId,
        i.Id as IngredientId,
        1 as Amount,
        '' as Note
    FROM (
        -- Sadece malzemeleri okuyoruz, değiştirmiyoruz
        SELECT Id, Ingredients FROM Recipes
    ) AS r
    CROSS APPLY STRING_SPLIT(REPLACE(REPLACE(r.Ingredients, '\n', ','), '\r', ''), ',') s
    JOIN Ingredients i ON TRIM(REPLACE(REPLACE(REPLACE(s.value, '-', ''), '\n', ''), '\r', '')) = i.Name
)
INSERT INTO RecipeIngredients (RecipeId, IngredientId, Amount, Note)
SELECT RecipeId, IngredientId, Amount, Note
FROM UniqueIngredients; 