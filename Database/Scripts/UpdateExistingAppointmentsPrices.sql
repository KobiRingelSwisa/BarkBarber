-- =============================================
-- Update Existing Appointments with Correct Prices
-- This script updates all existing appointments with their correct prices
-- based on the appointment type and discount status at creation time
-- =============================================

USE DogBarbershopDB;
GO

-- Step 1: Update all appointments with base price from AppointmentTypes
-- Set discount to 0 initially
UPDATE Appointments
SET 
    BasePrice = (SELECT Price FROM AppointmentTypes WHERE AppointmentTypes.Id = Appointments.AppointmentTypeId),
    DiscountAmount = 0,
    FinalPrice = (SELECT Price FROM AppointmentTypes WHERE AppointmentTypes.Id = Appointments.AppointmentTypeId)
WHERE BasePrice IS NULL OR BasePrice = 0 OR FinalPrice IS NULL OR FinalPrice = 0;
GO

-- Step 2: For each appointment, calculate the correct discount based on 
-- how many completed appointments the user had BEFORE this appointment was created
UPDATE Appointments
SET 
    DiscountAmount = CASE 
        WHEN (
            SELECT COUNT(*)
            FROM Appointments a2
            WHERE a2.UserId = Appointments.UserId
              AND a2.Status = 'Completed'
              AND a2.CreatedAt < Appointments.CreatedAt
        ) >= 3 THEN BasePrice * 0.10
        ELSE 0
    END,
    FinalPrice = CASE 
        WHEN (
            SELECT COUNT(*)
            FROM Appointments a2
            WHERE a2.UserId = Appointments.UserId
              AND a2.Status = 'Completed'
              AND a2.CreatedAt < Appointments.CreatedAt
        ) >= 3 THEN BasePrice * 0.90
        ELSE BasePrice
    END;
GO

-- Step 3: Verify the update
SELECT 
    a.Id,
    u.Username,
    at.Name AS AppointmentType,
    a.BasePrice,
    a.DiscountAmount,
    a.FinalPrice,
    a.Status,
    a.CreatedAt,
    (SELECT COUNT(*) 
     FROM Appointments a2 
     WHERE a2.UserId = a.UserId 
       AND a2.Status = 'Completed' 
       AND a2.CreatedAt < a.CreatedAt) AS CompletedBeforeThis
FROM Appointments a
INNER JOIN Users u ON a.UserId = u.Id
INNER JOIN AppointmentTypes at ON a.AppointmentTypeId = at.Id
ORDER BY u.Username, a.CreatedAt;
GO
