import { Box } from "@chakra-ui/react";
import { appointmentsOn, dayCounts, dayCountsText } from "../../utils/appointments";
import { formatLongDay } from "../../utils/dates";
import AgendaList from "../dashboard/AgendaList";
import CalendarToolbar from "./CalendarToolbar";

// Agenda de un día con navegación al día anterior y al siguiente
const DayCalendar = ({ day, appointments, onSelectAppointment, onPrev, onNext, onToday, emptyTitle, emptyDescription }) => {
  const list = appointmentsOn(appointments, day);
  return (
    <Box>
      <CalendarToolbar title={formatLongDay(day)} unit="Día" onPrev={onPrev} onNext={onNext} onToday={onToday} />
      <Box fontSize="sm" color="text.muted" mt={-3} mb={4}>
        {dayCountsText(dayCounts(list))}
      </Box>
      <AgendaList appointments={list} onSelect={onSelectAppointment} emptyTitle={emptyTitle} emptyDescription={emptyDescription} />
    </Box>
  );
};

export default DayCalendar;
