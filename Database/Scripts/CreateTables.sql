-- =============================================
-- Database Schema for Dog Barbershop Appointments System
-- Creates all required tables with proper relationships
-- =============================================

USE master;
GO

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DogBarbershopDB')
BEGIN
    CREATE DATABASE DogBarbershopDB;
END
GO

USE DogBarbershopDB;
GO

-- =============================================
-- Table: Users
-- Stores user account information
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Username NVARCHAR(50) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        FirstName NVARCHAR(100) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT CK_Username_NotEmpty CHECK (LEN(Username) > 0),
        CONSTRAINT CK_FirstName_NotEmpty CHECK (LEN(FirstName) > 0)
    );

    CREATE INDEX IX_Users_Username ON Users(Username);
END
GO

-- =============================================
-- Table: AppointmentTypes
-- Defines different types of dog grooming services
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AppointmentTypes')
BEGIN
    CREATE TABLE AppointmentTypes (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(50) NOT NULL UNIQUE,
        DurationMinutes INT NOT NULL,
        Price DECIMAL(10,2) NOT NULL,
        CONSTRAINT CK_Duration_Positive CHECK (DurationMinutes > 0),
        CONSTRAINT CK_Price_Positive CHECK (Price > 0)
    );

    CREATE INDEX IX_AppointmentTypes_Name ON AppointmentTypes(Name);
END
GO

-- =============================================
-- Table: Appointments
-- Stores appointment bookings
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Appointments')
BEGIN
    CREATE TABLE Appointments (
        Id INT PRIMARY KEY IDENTITY(1,1),
        UserId INT NOT NULL,
        AppointmentTypeId INT NOT NULL,
        ScheduledDate DATETIME2 NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Appointments_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Appointments_AppointmentTypes FOREIGN KEY (AppointmentTypeId) REFERENCES AppointmentTypes(Id),
        CONSTRAINT CK_Status_Valid CHECK (Status IN ('Pending', 'Completed', 'Cancelled')),
        CONSTRAINT CK_ScheduledDate_Future CHECK (ScheduledDate >= CAST(GETDATE() AS DATE))
    );

    CREATE INDEX IX_Appointments_UserId ON Appointments(UserId);
    CREATE INDEX IX_Appointments_ScheduledDate ON Appointments(ScheduledDate);
    CREATE INDEX IX_Appointments_Status ON Appointments(Status);
END
GO

-- =============================================
-- Table: AppointmentHistory
-- Tracks completed appointments for discount calculation
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AppointmentHistory')
BEGIN
    CREATE TABLE AppointmentHistory (
        Id INT PRIMARY KEY IDENTITY(1,1),
        AppointmentId INT NOT NULL,
        UserId INT NOT NULL,
        AppointmentTypeId INT NOT NULL,
        ScheduledDate DATETIME2 NOT NULL,
        CompletedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
        Price DECIMAL(10,2) NOT NULL,
        DiscountApplied DECIMAL(10,2) DEFAULT 0,
        FinalPrice DECIMAL(10,2) NOT NULL,
        CONSTRAINT FK_AppointmentHistory_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        CONSTRAINT FK_AppointmentHistory_AppointmentTypes FOREIGN KEY (AppointmentTypeId) REFERENCES AppointmentTypes(Id),
        CONSTRAINT CK_FinalPrice_Positive CHECK (FinalPrice >= 0)
    );

    CREATE INDEX IX_AppointmentHistory_UserId ON AppointmentHistory(UserId);
    CREATE INDEX IX_AppointmentHistory_CompletedDate ON AppointmentHistory(CompletedDate);
END
GO

