-- =============================================
-- Views for Dog Barbershop Database
-- =============================================

USE DogBarbershopDB;
GO

-- =============================================
-- View: vw_AppointmentsWithDetails
-- Displays appointments with customer and appointment type details
-- =============================================
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[vw_AppointmentsWithDetails]'))
    DROP VIEW [dbo].[vw_AppointmentsWithDetails];
GO

CREATE VIEW vw_AppointmentsWithDetails
AS
SELECT 
    a.Id AS AppointmentId,
    a.UserId,
    u.Username,
    u.FirstName,
    a.AppointmentTypeId,
    at.Name AS AppointmentTypeName,
    at.DurationMinutes,
    at.Price AS BasePrice,
    a.ScheduledDate,
    a.Status,
    a.CreatedAt AS AppointmentCreatedAt,
    u.CreatedAt AS UserCreatedAt
FROM 
    Appointments a
    INNER JOIN Users u ON a.UserId = u.Id
    INNER JOIN AppointmentTypes at ON a.AppointmentTypeId = at.Id;
GO

