-- =============================================
-- Queries to View Appointments in SQL Server
-- =============================================

USE DogBarbershopDB;
GO

-- =============================================
-- Query 1: View All Appointments (Simple)
-- =============================================
SELECT 
    Id AS AppointmentId,
    UserId,
    AppointmentTypeId,
    ScheduledDate,
    Status,
    CreatedAt
FROM 
    Appointments
ORDER BY 
    ScheduledDate DESC;
GO

-- =============================================
-- Query 2: View All Appointments with Details (Using View)
-- Shows appointments with user and appointment type information
-- =============================================
SELECT 
    AppointmentId,
    Username,
    FirstName AS CustomerName,
    AppointmentTypeName,
    DurationMinutes,
    BasePrice,
    ScheduledDate,
    Status,
    AppointmentCreatedAt
FROM 
    vw_AppointmentsWithDetails
ORDER BY 
    ScheduledDate DESC;
GO

-- =============================================
-- Query 3: View Appointments by Status
-- =============================================
SELECT 
    AppointmentId,
    Username,
    FirstName AS CustomerName,
    AppointmentTypeName,
    ScheduledDate,
    Status,
    AppointmentCreatedAt
FROM 
    vw_AppointmentsWithDetails
WHERE 
    Status = 'Pending'  -- Change to 'Completed' or 'Cancelled' as needed
ORDER BY 
    ScheduledDate;
GO

-- =============================================
-- Query 4: View Appointments by User
-- =============================================
SELECT 
    AppointmentId,
    Username,
    FirstName AS CustomerName,
    AppointmentTypeName,
    ScheduledDate,
    Status,
    AppointmentCreatedAt
FROM 
    vw_AppointmentsWithDetails
WHERE 
    Username = 'your_username_here'  -- Replace with actual username
ORDER BY 
    ScheduledDate DESC;
GO

-- =============================================
-- Query 5: View Upcoming Appointments
-- =============================================
SELECT 
    AppointmentId,
    Username,
    FirstName AS CustomerName,
    AppointmentTypeName,
    ScheduledDate,
    Status,
    AppointmentCreatedAt
FROM 
    vw_AppointmentsWithDetails
WHERE 
    ScheduledDate >= GETDATE()
    AND Status = 'Pending'
ORDER BY 
    ScheduledDate ASC;
GO

-- =============================================
-- Query 6: View Appointment History (Completed Appointments)
-- =============================================
SELECT 
    ah.Id AS HistoryId,
    ah.AppointmentId,
    u.Username,
    u.FirstName AS CustomerName,
    at.Name AS AppointmentTypeName,
    ah.ScheduledDate,
    ah.CompletedDate,
    ah.Price AS BasePrice,
    ah.DiscountApplied,
    ah.FinalPrice
FROM 
    AppointmentHistory ah
    INNER JOIN Users u ON ah.UserId = u.Id
    INNER JOIN AppointmentTypes at ON ah.AppointmentTypeId = at.Id
ORDER BY 
    ah.CompletedDate DESC;
GO

-- =============================================
-- Query 7: Count Appointments by Status
-- =============================================
SELECT 
    Status,
    COUNT(*) AS AppointmentCount
FROM 
    Appointments
GROUP BY 
    Status;
GO

-- =============================================
-- Query 8: View All Data (Full Details)
-- =============================================
SELECT 
    a.Id AS AppointmentId,
    u.Id AS UserId,
    u.Username,
    u.FirstName AS CustomerName,
    at.Id AS AppointmentTypeId,
    at.Name AS AppointmentTypeName,
    at.DurationMinutes,
    at.Price AS BasePrice,
    a.ScheduledDate,
    a.Status,
    a.CreatedAt AS AppointmentCreatedAt
FROM 
    Appointments a
    INNER JOIN Users u ON a.UserId = u.Id
    INNER JOIN AppointmentTypes at ON a.AppointmentTypeId = at.Id
ORDER BY 
    a.ScheduledDate DESC;
GO

