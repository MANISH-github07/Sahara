import { Smile, BookOpen, ClipboardCheck, CalendarDays } from "lucide-react";

export const DASHBOARD_STATS = [
  {
    id: 1,
    title: "Current Mood",
    value: "Calm",
    subtitle: "Feeling balanced today",
    icon: Smile,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    id: 2,
    title: "Journal Entries",
    value: "12",
    subtitle: "This month",
    icon: BookOpen,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    id: 3,
    title: "Assessment",
    value: "Completed",
    subtitle: "PHQ-9 & GAD-7",
    icon: ClipboardCheck,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    id: 4,
    title: "Appointments",
    value: "1 Upcoming",
    subtitle: "Next: Friday",
    icon: CalendarDays,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
];
