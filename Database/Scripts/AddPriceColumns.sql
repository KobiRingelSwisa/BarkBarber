-- =============================================
-- Add Price Columns to Appointments Table
-- This stores the final price at the time of appointment creation
-- to prevent retroactive price changes
-- =============================================

USE DogBarbershopDB;
GO

-- First, check if the table exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Appointments' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT 'Error: Appointments table does not exist. Please run CreateTables.sql first.';
    RETURN;
END

-- Add columns to store price information
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND name = 'BasePrice')
BEGIN
    ALTER TABLE Appointments
    ADD BasePrice DECIMAL(10,2) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND name = 'DiscountAmount')
BEGIN
    ALTER TABLE Appointments
    ADD DiscountAmount DECIMAL(10,2) NULL DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND name = 'FinalPrice')
BEGIN
    ALTER TABLE Appointments
    ADD FinalPrice DECIMAL(10,2) NULL;
END
GO

-- Update existing appointments with prices from AppointmentTypes
-- This is a one-time migration for existing data
-- Only update if all columns exist
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND name = 'BasePrice')
   AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND name = 'FinalPrice')
   AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND name = 'DiscountAmount')
BEGIN
    UPDATE a
    SET 
        a.BasePrice = ISNULL(a.BasePrice, at.Price),
        a.DiscountAmount = ISNULL(a.DiscountAmount, 0),
        a.FinalPrice = ISNULL(a.FinalPrice, at.Price)
    FROM Appointments a
    INNER JOIN AppointmentTypes at ON a.AppointmentTypeId = at.Id
    WHERE a.BasePrice IS NULL OR a.FinalPrice IS NULL;
    
    PRINT 'Updated existing appointments with base prices.';
END
ELSE
BEGIN
    PRINT 'Warning: Not all price columns exist. Skipping update.';
END
GO

-- Make BasePrice and FinalPrice NOT NULL after migration
-- Only if all rows have been updated (no NULL values)
IF NOT EXISTS (SELECT 1 FROM Appointments WHERE BasePrice IS NULL OR FinalPrice IS NULL)
BEGIN
    -- Drop default constraint if exists before altering
    DECLARE @sql NVARCHAR(MAX);
    
    -- Alter BasePrice
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND name = 'BasePrice' AND is_nullable = 1)
    BEGIN
        SET @sql = 'ALTER TABLE Appointments ALTER COLUMN BasePrice DECIMAL(10,2) NOT NULL';
        EXEC sp_executesql @sql;
    END
    
    -- Alter FinalPrice
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND name = 'FinalPrice' AND is_nullable = 1)
    BEGIN
        SET @sql = 'ALTER TABLE Appointments ALTER COLUMN FinalPrice DECIMAL(10,2) NOT NULL';
        EXEC sp_executesql @sql;
    END
    
    -- Alter DiscountAmount
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND name = 'DiscountAmount' AND is_nullable = 1)
    BEGIN
        SET @sql = 'ALTER TABLE Appointments ALTER COLUMN DiscountAmount DECIMAL(10,2) NOT NULL';
        EXEC sp_executesql @sql;
    END
END
ELSE
BEGIN
    PRINT 'Warning: Some appointments still have NULL prices. Please update them before making columns NOT NULL.';
END
GO

-- Add constraint to ensure FinalPrice is positive
-- Only if the column exists
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND name = 'FinalPrice')
   AND NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Appointments_FinalPrice_Positive')
BEGIN
    ALTER TABLE Appointments
    ADD CONSTRAINT CK_Appointments_FinalPrice_Positive CHECK (FinalPrice >= 0);
    
    PRINT 'Added constraint for FinalPrice.';
END
GO

