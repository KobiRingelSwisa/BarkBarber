using Microsoft.EntityFrameworkCore;
using DogBarbershopAPI.Models;

namespace DogBarbershopAPI.Data;

public class DogBarbershopDbContext : DbContext
{
    public DogBarbershopDbContext(DbContextOptions<DogBarbershopDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<AppointmentType> AppointmentTypes { get; set; }
    public DbSet<AppointmentHistory> AppointmentHistories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasIndex(e => e.Username).IsUnique();
        });

        modelBuilder.Entity<AppointmentType>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.DurationMinutes).IsRequired();
            entity.Property(e => e.Price).IsRequired().HasColumnType("decimal(10,2)");

            entity.HasIndex(e => e.Name).IsUnique();
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.AppointmentTypeId).IsRequired();
            entity.Property(e => e.ScheduledDate).IsRequired();
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CreatedAt).IsRequired();
            
            // Price fields - stored at appointment creation to prevent retroactive changes
            entity.Property(e => e.BasePrice).IsRequired().HasColumnType("decimal(10,2)");
            entity.Property(e => e.DiscountAmount).IsRequired().HasColumnType("decimal(10,2)").HasDefaultValue(0);
            entity.Property(e => e.FinalPrice).IsRequired().HasColumnType("decimal(10,2)");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Appointments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.AppointmentType)
                .WithMany(at => at.Appointments)
                .HasForeignKey(e => e.AppointmentTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ScheduledDate);
            entity.HasIndex(e => e.Status);
        });

        modelBuilder.Entity<AppointmentHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.AppointmentTypeId).IsRequired();
            entity.Property(e => e.ScheduledDate).IsRequired();
            entity.Property(e => e.CompletedDate).IsRequired();
            entity.Property(e => e.Price).IsRequired().HasColumnType("decimal(10,2)");
            entity.Property(e => e.DiscountApplied).IsRequired().HasColumnType("decimal(10,2)");
            entity.Property(e => e.FinalPrice).IsRequired().HasColumnType("decimal(10,2)");

            entity.HasOne(e => e.User)
                .WithMany(u => u.AppointmentHistories)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.AppointmentType)
                .WithMany(at => at.AppointmentHistories)
                .HasForeignKey(e => e.AppointmentTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CompletedDate);
        });
    }
}

