import type { AppointmentDetail } from "../../types";
import { AppointmentModal } from "../AppointmentModal";

interface DetailsDialogProps {
  appointment: AppointmentDetail;
  onClose: () => void;
  onStatusChange: () => void;
}

export const DetailsDialog: React.FC<DetailsDialogProps> = ({
  appointment,
  onClose,
  onStatusChange,
}) => {
  return (
    <AppointmentModal
      appointment={appointment}
      onClose={onClose}
      onStatusChange={onStatusChange}
    />
  );
};
