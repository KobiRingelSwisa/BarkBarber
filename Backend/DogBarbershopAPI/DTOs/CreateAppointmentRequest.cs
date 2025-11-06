namespace DogBarbershopAPI.DTOs;

public class CreateAppointmentRequest
{
    public int AppointmentTypeId { get; set; }
    public DateTime ScheduledDate { get; set; }
}

