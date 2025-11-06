namespace DogBarbershopAPI.Models;

public class Appointment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int AppointmentTypeId { get; set; }
    public DateTime ScheduledDate { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public AppointmentType AppointmentType { get; set; } = null!;
}

