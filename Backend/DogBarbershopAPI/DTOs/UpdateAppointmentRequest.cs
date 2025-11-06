namespace DogBarbershopAPI.DTOs;

public class UpdateAppointmentRequest
{
    public int AppointmentTypeId { get; set; }
    public DateTime ScheduledDate { get; set; }
}

