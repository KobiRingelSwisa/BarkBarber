import { Button } from "../Button";
import { Input } from "../Input";

interface FiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  searchTerm,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
}) => {
  const hasFilters = Boolean(searchTerm || dateFrom || dateTo);

  return (
    <div className="sticky top-20 z-30">
      <div className="rounded-xl border border-white/60 bg-white/70 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.04)] px-3 py-4 md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <div className="w-full sm:max-w-xs">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600" htmlFor="appointments-search">
                חיפוש לפי שם לקוח
              </label>
              <Input
                id="appointments-search"
                type="search"
                placeholder="לדוגמה: לונה"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="חיפוש לפי שם לקוח"
                className="py-2.5"
              />
            </div>
            <div className="w-full sm:max-w-[150px]">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600" htmlFor="appointments-date-from">
                מתאריך
              </label>
              <Input
                id="appointments-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                aria-label="סינון מתאריך"
                className="py-2.5"
              />
            </div>
            <div className="w-full sm:max-w-[150px]">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600" htmlFor="appointments-date-to">
                עד תאריך
              </label>
              <Input
                id="appointments-date-to"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => onDateToChange(e.target.value)}
                aria-label="סינון עד תאריך"
                className="py-2.5"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            {hasFilters && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClear}
                className="border border-amber-200 bg-white px-3 py-1.5 text-xs text-[#00BFA6] hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 focus:ring-offset-white"
              >
                איפוס פילטרים
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
