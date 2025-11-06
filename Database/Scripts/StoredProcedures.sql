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
    @BasePrice DECIMAL(10,2) OUTPUT,
    @DiscountAmount DECIMAL(10,2) OUTPUT,
    @FinalPrice DECIMAL(10,2) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CompletedAppointmentsCount INT;
    DECLARE @DiscountPercent DECIMAL(5,2) = 0;
    DECLARE @TypePrice DECIMAL(10,2);

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

    SELECT @CompletedAppointmentsCount = COUNT(*)
    FROM AppointmentHistory
    WHERE UserId = @UserId;

    IF @CompletedAppointmentsCount > 3
    BEGIN
        SET @DiscountPercent = 10.0;
    END

    SET @BasePrice = @TypePrice;
    SET @DiscountAmount = @BasePrice * (@DiscountPercent / 100.0);
    SET @FinalPrice = @BasePrice - @DiscountAmount;
END
GO

