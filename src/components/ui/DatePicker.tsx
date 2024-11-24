import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/formatDate";

type DatePickerProps = {
  date: string;
  setDate: (date: string) => void;
  label?: string;
  stylesForButton?: string;
};

export function DatePicker({
  date,
  setDate,
  label = "Pick a date",
  stylesForButton = "",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            stylesForButton
          )}
        >
          {date ? (
            formatDate({
              format: "DD-MM-YYYY",
              unformatedDate: date,
            })
          ) : (
            <span>{label}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date ? new Date(date) : new Date()}
          onSelect={(date) => {
            setDate(date ? date.toISOString() : "");
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
