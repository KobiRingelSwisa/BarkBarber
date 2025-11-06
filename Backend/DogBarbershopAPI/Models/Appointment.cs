namespace DogBarbershopAPI.Models;

public class Appointment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int AppointmentTypeId { get; set; }
    public DateTime ScheduledDate { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Price fields - stored at appointment creation to prevent retroactive changes
    public decimal BasePrice { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal FinalPrice { get; set; }

    public User User { get; set; } = null!;
    public AppointmentType AppointmentType { get; set; } = null!;
}

