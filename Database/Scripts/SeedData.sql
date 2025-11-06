-- =============================================
-- Seed Data for Dog Barbershop Database
-- Initial data for appointment types
-- =============================================

USE DogBarbershopDB;
GO

-- Insert appointment types if they don't exist
IF NOT EXISTS (SELECT * FROM AppointmentTypes WHERE Name = 'כלב קטן')
BEGIN
    INSERT INTO AppointmentTypes (Name, DurationMinutes, Price)
    VALUES ('כלב קטן', 30, 100.00);
END
GO

IF NOT EXISTS (SELECT * FROM AppointmentTypes WHERE Name = 'כלב בינוני')
BEGIN
    INSERT INTO AppointmentTypes (Name, DurationMinutes, Price)
    VALUES ('כלב בינוני', 45, 150.00);
END
GO

IF NOT EXISTS (SELECT * FROM AppointmentTypes WHERE Name = 'כלב גדול')
BEGIN
    INSERT INTO AppointmentTypes (Name, DurationMinutes, Price)
    VALUES ('כלב גדול', 60, 200.00);
END
GO

