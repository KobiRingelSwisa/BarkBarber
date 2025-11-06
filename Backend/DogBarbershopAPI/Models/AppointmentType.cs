namespace DogBarbershopAPI.Models;

public class AppointmentType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<AppointmentHistory> AppointmentHistories { get; set; } = new List<AppointmentHistory>();
}

