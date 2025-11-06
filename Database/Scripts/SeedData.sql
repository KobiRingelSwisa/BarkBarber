-- =============================================
-- Seed Data for Dog Barbershop Database
-- Initial data for appointment types
-- =============================================

USE DogBarbershopDB;
GO

-- Insert appointment types if they don't exist
-- Note: Using N prefix for Unicode strings (Hebrew text)
IF NOT EXISTS (SELECT * FROM AppointmentTypes WHERE Name = N'כלב קטן')
BEGIN
    INSERT INTO AppointmentTypes (Name, DurationMinutes, Price)
    VALUES (N'כלב קטן', 30, 100.00);
END
GO

IF NOT EXISTS (SELECT * FROM AppointmentTypes WHERE Name = N'כלב בינוני')
BEGIN
    INSERT INTO AppointmentTypes (Name, DurationMinutes, Price)
    VALUES (N'כלב בינוני', 45, 150.00);
END
GO

IF NOT EXISTS (SELECT * FROM AppointmentTypes WHERE Name = N'כלב גדול')
BEGIN
    INSERT INTO AppointmentTypes (Name, DurationMinutes, Price)
    VALUES (N'כלב גדול', 60, 200.00);
END
GO

