import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { appointmentService } from "../services/appointmentService";
import { AppointmentModal } from "../components/AppointmentModal";
import { Header } from "../components/Header";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { PawsBackground } from "../components/PawsBackground";
import type {
  Appointment,
  AppointmentDetail,
  AppointmentType,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "../types";

export const Appointments: React.FC = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterCustomerName, setFilterCustomerName] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    appointmentTypeId: 0,
    scheduledDate: "",
  });

  useEffect(() => {
    loadData();
  }, [filterDate, filterCustomerName]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, typesData] = await Promise.all([
        appointmentService.getAppointments(
          filterDate || undefined,
          filterCustomerName || undefined
        ),
        appointmentService.getAppointmentTypes(),
      ]);
      setAppointments(appointmentsData);
      setAppointmentTypes(typesData);
    } catch (err: any) {
      setError(err.response?.data?.message || "טעינת התורים נכשלה");
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentClick = async (id: number) => {
    try {
      const details = await appointmentService.getAppointmentDetails(id);
      setSelectedAppointment(details);
      setShowModal(true);
    } catch (err: any) {
      setError("טעינת פרטי התור נכשלה");
    }
  };

  const handleCreate = () => {
    setEditingAppointment(null);
    setFormData({
      appointmentTypeId: appointmentTypes[0]?.id || 0,
      scheduledDate: "",
    });
    setShowForm(true);
  };

  const formatDateForInput = (isoDateString: string): string => {
    const date = new Date(isoDateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      appointmentTypeId: appointment.appointmentTypeId,
      scheduledDate: formatDateForInput(appointment.scheduledDate),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את התור הזה?")) {
      return;
    }

    try {
      await appointmentService.deleteAppointment(id);
      await loadData();
      setError("");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "מחיקת התור נכשלה";
      setError(errorMessage);
      console.error("Delete appointment error:", err.response?.data || err);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await appointmentService.updateAppointmentStatus(id, newStatus);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "שינוי הסטטוס נכשל");
    }
  };

  const convertLocalDateTimeToISO = (localDateTime: string): string => {
    if (!localDateTime) return "";
    const [datePart, timePart] = localDateTime.split("T");
    if (!datePart || !timePart) {
      throw new Error("Invalid date format");
    }
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    if (isNaN(utcDate.getTime())) {
      throw new Error("Invalid date");
    }
    return utcDate.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const isoDate = convertLocalDateTimeToISO(formData.scheduledDate);

      if (editingAppointment) {
        const updateData: UpdateAppointmentRequest = {
          appointmentTypeId: formData.appointmentTypeId,
          scheduledDate: isoDate,
        };
        await appointmentService.updateAppointment(
          editingAppointment.id,
          updateData
        );
      } else {
        const createData: CreateAppointmentRequest = {
          appointmentTypeId: formData.appointmentTypeId,
          scheduledDate: isoDate,
        };
        await appointmentService.createAppointment(createData);
      }
      setShowForm(false);
      setEditingAppointment(null);
      await loadData();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "שמירת התור נכשלה"
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen relative">
      <PawsBackground backgroundColor="#FFF7ED" patternColor="#F59E0B" />
      <Header showAuth={true} userName={user?.firstName} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                ניהול תורים
              </h1>
              <p className="text-gray-600 text-lg">
                צפה וקבע תורים לתספורת הכלב שלך
              </p>
            </div>
            <Button
              onClick={handleCreate}
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex justify-center items-center"
            >
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              תור חדש
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm animate-fade-in">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters Card */}
            <Card
              className="p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg"
              spotlightColor="rgba(251, 191, 36, 0.2)"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">סינון תורים</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    סנן לפי תאריך
                  </label>
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    סנן לפי שם לקוח
                  </label>
                  <Input
                    type="text"
                    placeholder="הכנס שם לקוח"
                    value={filterCustomerName}
                    onChange={(e) => setFilterCustomerName(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Appointments List */}
            <Card
              className="p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg"
              spotlightColor="rgba(251, 191, 36, 0.2)"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    רשימת תורים
                  </h2>
                  {appointments.length > 0 && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                      {appointments.length}
                    </span>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
                    <svg
                      className="w-10 h-10 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    לא נמצאו תורים
                  </h3>
                  <p className="text-gray-600 mb-6">
                    התחל על ידי יצירת תור חדש
                  </p>
                  <Button
                    onClick={handleCreate}
                    variant="primary"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 border-0"
                  >
                    צור את התור הראשון שלך
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => {
                    const isSameDay = (() => {
                      const appointmentDate = new Date(
                        appointment.scheduledDate
                      );
                      const today = new Date();
                      const appointmentDateOnly = new Date(
                        appointmentDate.getFullYear(),
                        appointmentDate.getMonth(),
                        appointmentDate.getDate()
                      );
                      const todayDateOnly = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate()
                      );
                      return (
                        appointmentDateOnly.getTime() ===
                        todayDateOnly.getTime()
                      );
                    })();

                    return (
                      <div
                        key={appointment.id}
                        className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                        onClick={() => handleAppointmentClick(appointment.id)}
                      >
                        <div className="p-6">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                            {/* Left Section - Customer Info */}
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                                  <span className="text-white font-bold text-xl">
                                    {appointment.firstName
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-2">
                                  <h3 className="text-lg font-bold text-gray-900 truncate">
                                    {appointment.firstName}
                                  </h3>
                                  <span
                                    className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(
                                      appointment.status
                                    )}`}
                                  >
                                    {appointment.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4 break-all">
                                  @{appointment.username}
                                </p>

                                {/* Info Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                  <div className="flex items-start gap-2 text-sm">
                                    <svg
                                      className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                      />
                                    </svg>
                                    <span className="text-gray-600">
                                      {appointment.appointmentTypeName ||
                                        "לא זמין"}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm">
                                    <svg
                                      className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span className="text-gray-600">
                                      {formatDate(appointment.scheduledDate)}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm">
                                    <svg
                                      className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span className="text-gray-900 font-semibold whitespace-nowrap">
                                      {appointment.discountAmount > 0 && (
                                        <span className="text-gray-400 line-through mr-2 text-xs">
                                          ₪{appointment.basePrice.toFixed(2)}
                                        </span>
                                      )}
                                      ₪{appointment.finalPrice.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Section - Actions */}
                            {user && appointment.userId === user.id && (
                              <div
                                className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {appointment.status !== "Completed" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(appointment);
                                    }}
                                    className="w-full sm:flex-1 lg:w-auto border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
                                  >
                                    <svg
                                      className="w-4 h-4 ml-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                    ערוך
                                  </Button>
                                )}
                                {!isSameDay && (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(appointment.id);
                                    }}
                                    className="w-full sm:flex-1 lg:w-auto bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                  >
                                    <svg
                                      className="w-4 h-4 ml-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                    מחק
                                  </Button>
                                )}
                                {appointment.status === "Pending" &&
                                  new Date(appointment.scheduledDate) <=
                                    new Date() && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(
                                          appointment.id,
                                          "Completed"
                                        );
                                      }}
                                      className="w-full sm:flex-1 lg:w-auto bg-emerald-500 text-white hover:bg-emerald-600 border-0"
                                    >
                                      <svg
                                        className="w-4 h-4 ml-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                      הושלם
                                    </Button>
                                  )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Why Choose Us Card */}
            <Card
              className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl border-0"
              spotlightColor="rgba(255, 255, 255, 0.2)"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">למה לבחור בנו?</h3>
              </div>
              <ul className="space-y-3 text-amber-50">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>שירותי תספורת מקצועיים</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>הנחות נאמנות ללקוחות קבועים</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>קביעת תורים קלה באינטרנט</span>
                </li>
              </ul>
            </Card>

            {/* Service Types Card */}
            {appointmentTypes.length > 0 && (
              <Card
                className="p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg"
                spotlightColor="rgba(251, 191, 36, 0.2)"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    סוגי שירותים
                  </h3>
                </div>
                <div className="space-y-3">
                  {appointmentTypes.map((type) => (
                    <div
                      key={type.id}
                      className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100 hover:border-amber-200 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900">{type.name}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {type.durationMinutes} דקות
                          </p>
                        </div>
                        <p className="font-bold text-amber-600 text-lg">
                          ₪{type.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card
            className="max-w-md w-full p-8 shadow-2xl bg-white border-0"
            spotlightColor="rgba(251, 191, 36, 0.15)"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAppointment ? "ערוך תור" : "תור חדש"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAppointment(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  סוג תור
                </label>
                <select
                  value={formData.appointmentTypeId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointmentTypeId: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-gray-900 bg-white"
                  required
                >
                  <option value="">בחר סוג</option>
                  {appointmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {type.durationMinutes} דק' - ₪{type.price}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="תאריך ושעה מתוכננים"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledDate: e.target.value })
                }
                required
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAppointment(null);
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  ביטול
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 border-0"
                >
                  {editingAppointment ? "עדכן" : "צור"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showModal && selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowModal(false);
            setSelectedAppointment(null);
          }}
          onStatusChange={loadData}
        />
      )}
    </div>
  );
};
