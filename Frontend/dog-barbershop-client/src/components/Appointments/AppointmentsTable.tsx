import { useEffect, useMemo, useState } from "react";
import { Button } from "../Button";
import type { Appointment } from "../../types";

const PAGE_SIZE_DEFAULT = 20;

const groomingBadgeClass = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("קטן") || normalized.includes("small")) {
    return "bg-teal-50 text-[#00BFA6]";
  }
  if (normalized.includes("בינוני") || normalized.includes("medium")) {
    return "bg-orange-50 text-[#FFB547]";
  }
  if (normalized.includes("גדול") || normalized.includes("large")) {
    return "bg-rose-50 text-rose-500";
  }
  return "bg-gray-100 text-gray-600";
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const isSameDay = (iso: string) => {
  const date = new Date(iso);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

type TableMode = "upcoming" | "history";

interface AppointmentsTableProps {
  items: Appointment[];
  mode: TableMode;
  isLoading?: boolean;
  onRowClick: (id: number) => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  withPagination?: boolean;
  compact?: boolean;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  items,
  mode,
  isLoading = false,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  page = 1,
  onPageChange,
  pageSize = PAGE_SIZE_DEFAULT,
  withPagination = false,
  compact = false,
}) => {
  const [internalPage, setInternalPage] = useState(1);

  useEffect(() => {
    setInternalPage(1);
  }, [items]);

  const currentPage = onPageChange ? page : internalPage;
  const effectivePageSize = withPagination ? pageSize : items.length;

  const paginatedItems = useMemo(() => {
    if (!withPagination) return items;
    const start = (currentPage - 1) * effectivePageSize;
    return items.slice(start, start + effectivePageSize);
  }, [items, withPagination, currentPage, effectivePageSize]);

  const totalPages = withPagination
    ? Math.max(1, Math.ceil(items.length / effectivePageSize))
    : 1;

  const handlePageChange = (nextPage: number) => {
    if (!withPagination) return;
    const clamped = Math.min(Math.max(nextPage, 1), totalPages);
    if (onPageChange) {
      onPageChange(clamped);
    } else {
      setInternalPage(clamped);
    }
  };

  const skeletonRows = Array.from({ length: compact ? 3 : 5 });

  const renderPrice = (appointment: Appointment) => (
    <div className="flex flex-col items-end text-sm">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-800">
          ₪{appointment.finalPrice.toFixed(2)}
        </span>
        {appointment.discountAmount > 0 && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
            -10%
          </span>
        )}
      </div>
      {appointment.discountAmount > 0 && (
        <span className="text-xs text-gray-400 line-through">
          ₪{appointment.basePrice.toFixed(2)}
        </span>
      )}
    </div>
  );

  const renderActions = (appointment: Appointment) => {
    if (mode === "history") {
      return (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onView?.(appointment.id);
          }}
          className="border border-amber-200 bg-white text-[#00BFA6] hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white"
        >
          צפה
        </Button>
      );
    }

    const disableDelete = isSameDay(appointment.scheduledDate);

    return (
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.(appointment);
          }}
          className="border-[#00BFA6] text-[#00BFA6] hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white"
        >
          ערוך
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={disableDelete}
          title={disableDelete ? "לא ניתן למחוק תורים באותו היום" : undefined}
          onClick={(event) => {
            event.stopPropagation();
            if (!disableDelete) {
              onDelete?.(appointment.id);
            }
          }}
          className={`focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white ${
            disableDelete
              ? "cursor-not-allowed bg-gray-100 text-gray-400 hover:bg-gray-100"
              : ""
          }`}
        >
          מחק
        </Button>
      </div>
    );
  };

  const TableContent = () => (
    <table className="min-w-full border-separate border-spacing-y-2 text-right">
      <thead>
        <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          <th className="rounded-tr-2xl rounded-br-2xl bg-gray-50 px-4 py-3 text-right">
            שם לקוח
          </th>
          <th className="bg-gray-50 px-4 py-3">שעת הגעה</th>
          <th className="bg-gray-50 px-4 py-3">סוג כלב</th>
          <th className="bg-gray-50 px-4 py-3">מחיר</th>
          <th className="rounded-tl-2xl rounded-bl-2xl bg-gray-50 px-4 py-3 text-left">
            פעולה
          </th>
        </tr>
      </thead>
      <tbody>
        {paginatedItems.map((appointment, index) => (
          <tr
            key={appointment.id}
            onClick={() => onRowClick(appointment.id)}
            className={`cursor-pointer rounded-2xl bg-white text-sm shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
              index % 2 === 0 ? "" : "" // zebra effect handled by gap
            }`}
          >
            <td className="rounded-r-2xl px-4 py-4 text-right align-middle">
              <div className="flex flex-row-reverse items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFB547] to-[#FF9142] text-white shadow-inner">
                  {appointment.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="font-semibold text-gray-900">
                  {appointment.firstName}
                </div>
              </div>
            </td>
            <td className="px-4 py-4 text-gray-700 align-middle">
              {formatDateTime(appointment.scheduledDate)}
            </td>
            <td className="px-4 py-4 align-middle">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${groomingBadgeClass(
                  appointment.appointmentTypeName
                )}`}
              >
                <span aria-hidden="true">🐶</span>
                {appointment.appointmentTypeName || "לא זמין"}
              </span>
            </td>
            <td className="px-4 py-4 align-middle">{renderPrice(appointment)}</td>
            <td className="rounded-l-2xl px-4 py-4 text-left align-middle">
              {renderActions(appointment)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const TableSkeleton = () => (
    <div className="space-y-3">
      {skeletonRows.map((_, idx) => (
        <div
          key={idx}
          className="h-16 animate-pulse rounded-2xl bg-gray-100"
        />
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
        {mode === "upcoming" ? "🐶" : "📘"}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">
        {mode === "upcoming" ? "אין תורים עתידיים" : "אין היסטוריה"}
      </h3>
      <p className="text-sm text-gray-500">
        {mode === "upcoming"
          ? "קבע תור חדש כדי לראות אותו כאן"
          : "כשתסיים תור, הוא יוצג באזור זה"}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <div className="rounded-3xl border border-white/60 bg-[#F9FAFB] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
          {isLoading ? (
            <TableSkeleton />
          ) : paginatedItems.length > 0 ? (
            <TableContent />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {isLoading
          ? skeletonRows.map((_, idx) => (
              <div
                key={idx}
                className="h-28 animate-pulse rounded-2xl bg-gray-100"
              />
            ))
          : paginatedItems.length > 0
          ? paginatedItems.map((appointment) => (
              <div
                key={appointment.id}
                onClick={() => onRowClick(appointment.id)}
                className="space-y-4 rounded-2xl border border-white/60 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-row-reverse items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFB547] to-[#FF9142] text-white shadow-inner">
                      {appointment.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-gray-900">
                        {appointment.firstName}
                      </p>
                      <span
                        className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${groomingBadgeClass(
                          appointment.appointmentTypeName
                        )}`}
                      >
                        <span aria-hidden="true">🐶</span>
                        {appointment.appointmentTypeName || "לא זמין"}
                      </span>
                    </div>
                  </div>
                  {mode === "history" ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onView?.(appointment.id);
                      }}
                      className="border border-amber-200 bg-white text-[#00BFA6] hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white"
                    >
                      צפה
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit?.(appointment);
                        }}
                        className="border-[#00BFA6] text-[#00BFA6] hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white"
                      >
                        ערוך
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={isSameDay(appointment.scheduledDate)}
                        title={isSameDay(appointment.scheduledDate)
                          ? "לא ניתן למחוק תורים באותו היום"
                          : undefined}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!isSameDay(appointment.scheduledDate)) {
                            onDelete?.(appointment.id);
                          }
                        }}
                        className={`focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white ${
                          isSameDay(appointment.scheduledDate)
                            ? "cursor-not-allowed bg-gray-100 text-gray-400 hover:bg-gray-100"
                            : ""
                        }`}
                      >
                        מחק
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">שעת הגעה</p>
                    <p className="font-medium">
                      {formatDateTime(appointment.scheduledDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">מחיר</p>
                    {renderPrice(appointment)}
                  </div>
                </div>
              </div>
            ))
          : (
              <EmptyState />
            )}
      </div>

      {withPagination && items.length > effectivePageSize && (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            className="border border-amber-200 bg-white text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white"
            disabled={currentPage === 1}
          >
            קודם
          </Button>
          <span className="text-sm text-gray-500">
            עמוד {currentPage} מתוך {totalPages}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            className="border border-amber-200 bg-white text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-white"
            disabled={currentPage === totalPages}
          >
            הבא
          </Button>
        </div>
      )}
    </div>
  );
};
