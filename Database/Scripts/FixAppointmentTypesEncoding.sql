-- =============================================
-- Fix AppointmentTypes Encoding
-- This script fixes encoding issues by updating existing records
-- =============================================

USE DogBarbershopDB;
GO

-- Update existing appointment types with correct Unicode encoding
-- Using N prefix ensures proper Unicode (UTF-16) storage

UPDATE AppointmentTypes 
SET Name = N'כלב קטן' 
WHERE Id = 1 OR Name LIKE '%קטן%' OR Name LIKE '%small%';
GO

UPDATE AppointmentTypes 
SET Name = N'כלב בינוני' 
WHERE Id = 2 OR Name LIKE '%בינוני%' OR Name LIKE '%medium%';
GO

UPDATE AppointmentTypes 
SET Name = N'כלב גדול' 
WHERE Id = 3 OR Name LIKE '%גדול%' OR Name LIKE '%large%';
GO

-- Verify the fix
SELECT 
    Id,
    Name,
    DurationMinutes,
    Price
FROM AppointmentTypes;
GO

