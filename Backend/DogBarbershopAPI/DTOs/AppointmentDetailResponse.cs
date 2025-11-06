namespace DogBarbershopAPI.DTOs;

public class AppointmentDetailResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public int AppointmentTypeId { get; set; }
    public string AppointmentTypeName { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public decimal BasePrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalPrice { get; set; }
    public DateTime ScheduledDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UserCreatedAt { get; set; }
}

