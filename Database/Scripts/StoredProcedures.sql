-- =============================================
-- Stored Procedures for Dog Barbershop Database
-- =============================================

USE DogBarbershopDB;
GO

-- =============================================
-- Procedure: sp_CalculateAppointmentPrice
-- Calculates the final price for an appointment including discount
-- Discount: 10% for customers with more than 3 completed appointments
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CalculateAppointmentPrice]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_CalculateAppointmentPrice];
GO

CREATE PROCEDURE sp_CalculateAppointmentPrice
    @UserId INT,
    @AppointmentTypeId INT,
    @CreatedAt DATETIME2 = NULL,
    @BasePrice DECIMAL(10,2) OUTPUT,
    @DiscountAmount DECIMAL(10,2) OUTPUT,
    @FinalPrice DECIMAL(10,2) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CompletedAppointmentsCount INT;
    DECLARE @DiscountPercent DECIMAL(5,2) = 0;
    DECLARE @TypePrice DECIMAL(10,2);

    -- If @CreatedAt is not provided, use current time
    IF @CreatedAt IS NULL
    BEGIN
        SET @CreatedAt = GETUTCDATE();
    END

    SELECT @TypePrice = Price
    FROM AppointmentTypes
    WHERE Id = @AppointmentTypeId;

    IF @TypePrice IS NULL
    BEGIN
        SET @BasePrice = 0;
        SET @DiscountAmount = 0;
        SET @FinalPrice = 0;
        RETURN;
    END

    -- Count only completed appointments that were created BEFORE this appointment
    -- This prevents retroactive discount application
    -- Using < instead of <= to exclude the current appointment being created
    SELECT @CompletedAppointmentsCount = COUNT(*)
    FROM Appointments
    WHERE UserId = @UserId
      AND Status = 'Completed'
      AND CreatedAt < @CreatedAt;
    
    -- Debug output to help diagnose discount issues
    -- This will show in SQL Server logs/console
    DECLARE @DebugMsg NVARCHAR(500);
    SET @DebugMsg = 'User: ' + CAST(@UserId AS NVARCHAR(10)) + 
                    ', Completed appointments: ' + CAST(@CompletedAppointmentsCount AS NVARCHAR(10)) + 
                    ', CreatedAt: ' + CAST(@CreatedAt AS NVARCHAR(50)) + 
                    ', Discount: ' + CAST(CASE WHEN @CompletedAppointmentsCount >= 3 THEN '10%' ELSE '0%' END AS NVARCHAR(10));
    -- Uncomment the line below to see debug output in SQL Server Management Studio
    -- PRINT @DebugMsg;

    -- If customer has 3 or more completed appointments BEFORE this appointment, give 10% discount
    -- This means the 4th appointment (and onwards) gets the discount
    IF @CompletedAppointmentsCount >= 3
    BEGIN
        SET @DiscountPercent = 10.0;
    END

    SET @BasePrice = @TypePrice;
    SET @DiscountAmount = @BasePrice * (@DiscountPercent / 100.0);
    SET @FinalPrice = @BasePrice - @DiscountAmount;
END
GO

