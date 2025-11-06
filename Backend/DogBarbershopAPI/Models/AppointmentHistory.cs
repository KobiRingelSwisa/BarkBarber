namespace DogBarbershopAPI.Models;

public class AppointmentHistory
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public int UserId { get; set; }
    public int AppointmentTypeId { get; set; }
    public DateTime ScheduledDate { get; set; }
    public DateTime CompletedDate { get; set; } = DateTime.UtcNow;
    public decimal Price { get; set; }
    public decimal DiscountApplied { get; set; }
    public decimal FinalPrice { get; set; }

    public User User { get; set; } = null!;
    public AppointmentType AppointmentType { get; set; } = null!;
}

