import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Header } from "../../components/Header";
import { PawsBackground } from "../../components/PawsBackground";
import { FiltersBar } from "../../components/Appointments/FiltersBar";
import { AppointmentsTable } from "../../components/Appointments/AppointmentsTable";
import { DetailsDialog } from "../../components/Appointments/DetailsDialog";
import { appointmentService } from "../../services/appointmentService";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import type {
  Appointment,
  AppointmentDetail,
  AppointmentType,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "../../types";

const DATE_INPUT_EMPTY = "";

const startOfDay = (value: string) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value: string) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const formatDateForInput = (iso: string): { date: string; time: string } => {
  const date = new Date(iso);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
};

const combineDateAndTimeToISO = (date: string, time: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day, hour, minute));
  return utc.toISOString();
};

const sanitizeDateRange = (from: string, to: string): [string, string] => {
  if (from && to && from > to) {
    return [to, from];
  }
  return [from, to];
};

const ITEMS_PER_PAGE_HISTORY = 20;

const AppointmentsPage: React.FC = () => {
  const { user, logout } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    dateFrom: DATE_INPUT_EMPTY,
    dateTo: DATE_INPUT_EMPTY,
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [formState, setFormState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    appointment?: Appointment | null;
  }>({ isOpen: false, mode: "create", appointment: null });

  const [formData, setFormData] = useState({
    appointmentTypeId: 0,
    selectedDate: "",
    selectedTime: "",
  });

  const upcomingHeadingId = useId();
  const historyHeadingId = useId();
  const historyPanelId = useId();

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await appointmentService.getAppointmentTypes();
        setAppointmentTypes(types);
      } catch (err: any) {
        console.error("Failed loading appointment types", err);
      }
    };
    fetchTypes();
  }, []);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [fromRaw, toRaw] = sanitizeDateRange(
        filters.dateFrom,
        filters.dateTo
      );

      const sameDay =
        fromRaw && toRaw && fromRaw === toRaw ? fromRaw : undefined;
      const data = await appointmentService.getAppointments(
        sameDay || undefined,
        filters.search || undefined
      );

      let filtered = data;
      if (fromRaw) {
        const fromDate = startOfDay(fromRaw);
        filtered = filtered.filter(
          (appointment) => new Date(appointment.scheduledDate) >= fromDate
        );
      }
      if (toRaw) {
        const toDate = endOfDay(toRaw);
        filtered = filtered.filter(
          (appointment) => new Date(appointment.scheduledDate) <= toDate
        );
      }

      setAppointments(filtered);
      setHistoryPage(1);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "טעינת התורים נכשלה");
    } finally {
      setLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo, filters.search]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return [...appointments]
      .filter((appointment) => new Date(appointment.scheduledDate) >= now)
      .sort(
        (a, b) =>
          new Date(a.scheduledDate).getTime() -
          new Date(b.scheduledDate).getTime()
      );
  }, [appointments]);

  const historyAppointments = useMemo(() => {
    const now = new Date();
    return [...appointments]
      .filter((appointment) => new Date(appointment.scheduledDate) < now)
      .sort(
        (a, b) =>
          new Date(b.scheduledDate).getTime() -
          new Date(a.scheduledDate).getTime()
      );
  }, [appointments]);

  useEffect(() => {
    setHistoryPage(1);
  }, [historyAppointments.length]);

  const handleOpenDetails = async (appointmentId: number) => {
    try {
      const details = await appointmentService.getAppointmentDetails(
        appointmentId
      );
      setDetail(details);
      setIsDetailOpen(true);
    } catch (err: any) {
      console.error(err);
      setError("טעינת פרטי התור נכשלה");
    }
  };

  const closeDetails = () => {
    setIsDetailOpen(false);
    setDetail(null);
  };

  const handleCreate = () => {
    setFormState({ isOpen: true, mode: "create", appointment: null });
    setFormData({
      appointmentTypeId: appointmentTypes[0]?.id || 0,
      selectedDate: "",
      selectedTime: "",
    });
  };

  const handleEdit = (appointment: Appointment) => {
    const { date, time } = formatDateForInput(appointment.scheduledDate);
    setFormState({ isOpen: true, mode: "edit", appointment });
    setFormData({
      appointmentTypeId: appointment.appointmentTypeId,
      selectedDate: date,
      selectedTime: time,
    });
  };

  const closeForm = () => {
    setFormState({ isOpen: false, mode: "create", appointment: null });
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const isoDate = combineDateAndTimeToISO(
        formData.selectedDate,
        formData.selectedTime
      );

      if (formState.mode === "edit" && formState.appointment) {
        const updateRequest: UpdateAppointmentRequest = {
          appointmentTypeId: formData.appointmentTypeId,
          scheduledDate: isoDate,
        };
        await appointmentService.updateAppointment(
          formState.appointment.id,
          updateRequest
        );
      } else {
        const createRequest: CreateAppointmentRequest = {
          appointmentTypeId: formData.appointmentTypeId,
          scheduledDate: isoDate,
        };
        await appointmentService.createAppointment(createRequest);
      }

      closeForm();
      await fetchAppointments();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "שמירת התור נכשלה");
    }
  };

  const handleDelete = async (appointmentId: number) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את התור הזה?")) {
      return;
    }
    try {
      await appointmentService.deleteAppointment(appointmentId);
      setAppointments((prev) => prev.filter((app) => app.id !== appointmentId));
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "מחיקת התור נכשלה");
    }
  };

  return (
    <div className="min-h-screen">
      <PawsBackground backgroundColor="#FFF7ED" patternColor="#F59E0B" />
      <Header showAuth userName={user?.firstName} onLogout={logout} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="mb-10 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2 text-right">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#00BFA6] shadow-sm">
                🐾 לוח תורים
              </span>
              <h1 className="text-3xl font-bold text-[#222] sm:text-4xl">
                ניהול תורים למספרת BarkBarber
              </h1>
              <p className="text-sm text-gray-500">
                עקוב אחר התורים הקרובים שלך, נהל שינויים וצפה בהיסטוריה—all
                בלחיצה אחת.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card
                className="rounded-2xl border border-white/60 bg-white/85 px-5 py-4 text-right shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
                spotlightColor="rgba(0, 191, 166, 0.25)"
              >
                <p className="text-xs font-semibold text-gray-500">
                  תורים עתידיים
                </p>
                <p className="text-3xl font-bold text-[#00BFA6]">
                  {upcomingAppointments.length}
                </p>
                <p className="text-xs text-gray-400">כולל היום ומעבר</p>
              </Card>
              <Card
                className="rounded-2xl border border-white/60 bg-white/85 px-5 py-4 text-right shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
                spotlightColor="rgba(255, 181, 71, 0.25)"
              >
                <p className="text-xs font-semibold text-gray-500">
                  תורים היסטוריים
                </p>
                <p className="text-3xl font-bold text-[#FFB547]">
                  {historyAppointments.length}
                </p>
                <p className="text-xs text-gray-400">כל התורים שהושלמו</p>
              </Card>
              {upcomingAppointments[0] ? (
                <Card
                  className="rounded-2xl border border-white/60 bg-white/85 px-5 py-4 text-right shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
                  spotlightColor="rgba(0,0,0,0.08)"
                >
                  <p className="text-xs font-semibold text-gray-500">
                    התור הקרוב
                  </p>
                  <p className="text-lg font-semibold text-[#222]">
                    {upcomingAppointments[0].firstName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(
                      upcomingAppointments[0].scheduledDate
                    ).toLocaleString("he-IL", {
                      weekday: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Card>
              ) : (
                <Card
                  className="rounded-2xl border border-white/60 bg-white/85 px-5 py-4 text-right shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
                  spotlightColor="rgba(0,0,0,0.05)"
                >
                  <p className="text-xs font-semibold text-gray-500">
                    התור הקרוב
                  </p>
                  <p className="text-sm text-gray-400">אין תורים ברשימה כרגע</p>
                </Card>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-full bg-[#00BFA6] px-6 py-3 text-lg font-semibold text-white shadow-[0_16px_32px_rgba(0,191,166,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,191,166,0.35)] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white"
            >
              <span className="text-xl leading-none">+</span>
              קבע תור חדש
            </Button>
          </div>

          <FiltersBar
            searchTerm={filters.search}
            onSearchChange={(value) =>
              setFilters((prev) => ({ ...prev, search: value }))
            }
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onDateFromChange={(value) =>
              setFilters((prev) => ({ ...prev, dateFrom: value }))
            }
            onDateToChange={(value) =>
              setFilters((prev) => ({ ...prev, dateTo: value }))
            }
            onClear={() =>
              setFilters({
                search: "",
                dateFrom: DATE_INPUT_EMPTY,
                dateTo: DATE_INPUT_EMPTY,
              })
            }
          />

          
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        <section aria-labelledby={upcomingHeadingId} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2
              id={upcomingHeadingId}
              className="text-xl font-semibold text-[#222]"
            >
              תורים עתידיים ({upcomingAppointments.length})
            </h2>
          </div>
          <AppointmentsTable
            items={upcomingAppointments}
            mode="upcoming"
            isLoading={loading}
            onRowClick={handleOpenDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>

        <section aria-labelledby={historyHeadingId} className="mt-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2
              id={historyHeadingId}
              className="text-xl font-semibold text-[#222]"
            >
              תורים היסטוריים ({historyAppointments.length})
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-expanded={isHistoryOpen}
              aria-controls={historyPanelId}
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              className="border border-amber-200 bg-white text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white"
            >
              {isHistoryOpen ? "הסתר היסטוריה" : "הצג היסטוריה"}
            </Button>
          </div>

          {isHistoryOpen && (
            <div id={historyPanelId}>
              <AppointmentsTable
                items={historyAppointments}
                mode="history"
                isLoading={loading}
                onRowClick={handleOpenDetails}
                onView={handleOpenDetails}
                withPagination
                page={historyPage}
                onPageChange={setHistoryPage}
                pageSize={ITEMS_PER_PAGE_HISTORY}
                compact
              />
            </div>
          )}

          {!isHistoryOpen && historyAppointments.length > 0 && (
            <p className="text-sm text-gray-500">
              לחץ על "הצג היסטוריה" כדי לראות את כל התורים שהושלמו.
            </p>
          )}
        </section>
      </main>

      {formState.isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6">
          <Card
            className="w-full max-w-lg rounded-3xl border border-white/40 bg-white p-8 shadow-[0_24px_48px_rgba(0,0,0,0.15)]"
            spotlightColor="rgba(255, 181, 71, 0.25)"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-[#222]">
                  {formState.mode === "edit" ? "עריכת תור" : "תור חדש"}
                </h3>
                <p className="text-sm text-gray-500">
                  מלא את הפרטים כדי לשמור שינויים במספרה.
                </p>
              </div>
              <button
                onClick={closeForm}
                className="text-3xl leading-none text-gray-400 transition hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white"
                aria-label="סגירת חלון יצירת התור"
              >
                ×
              </button>
            </div>
            <form className="space-y-6" onSubmit={handleFormSubmit}>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-gray-600"
                  htmlFor="form-type"
                >
                  סוג תספורת
                </label>
                <select
                  id="form-type"
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-right text-gray-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white"
                  value={formData.appointmentTypeId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointmentTypeId: Number(e.target.value),
                    })
                  }
                  required
                >
                  <option value="" disabled>
                    בחר סוג
                  </option>
                  {appointmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} · {type.durationMinutes} דק׳ · ₪{type.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-gray-600"
                    htmlFor="form-date"
                  >
                    תאריך
                  </label>
                  <Input
                    id="form-date"
                    type="date"
                    value={formData.selectedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, selectedDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-gray-600"
                    htmlFor="form-time"
                  >
                    שעה
                  </label>
                  <select
                    id="form-time"
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-right text-gray-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white"
                    value={formData.selectedTime}
                    onChange={(e) =>
                      setFormData({ ...formData, selectedTime: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled>
                      בחר שעה
                    </option>
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const hour = 9 + idx;
                      const label = `${String(hour).padStart(2, "0")}:00`;
                      return (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeForm}
                  className="border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white"
                >
                  ביטול
                </Button>
                <Button
                  type="submit"
                  className="bg-[#00BFA6] text-white hover:bg-[#00a792] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white"
                >
                  {formState.mode === "edit" ? "שמירת שינויים" : "יצירת תור"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isDetailOpen && detail && (
        <DetailsDialog
          appointment={detail}
          onClose={closeDetails}
          onStatusChange={() => {
            closeDetails();
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
