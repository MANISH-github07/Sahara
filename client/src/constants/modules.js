import {
  ShieldCheck,
  ClipboardCheck,
  Heart,
  Bot,
  Stethoscope,
  ShieldAlert,
  BarChart3,
} from "lucide-react";

export const MODULES = [
  {
    id: 1,
    title: "Identity & Security",
    features: ["Registration • Consent • RBAC"],
    icon: ShieldCheck,
    color: "text-cyan-400",
  },
  {
    id: 2,
    title: "Screening",
    features: ["PHQ-9 • GAD-7"],
    icon: ClipboardCheck,
    color: "text-violet-400",
  },
  {
    id: 3,
    title: "Wellness",
    features: ["Journal • Grounding"],
    icon: Heart,
    color: "text-green-400",
  },
  {
    id: 4,
    title: "Responsible AI",
    features: ["Chat • Reflection"],
    icon: Bot,
    color: "text-blue-400",
  },
  {
    id: 5,
    title: "Professional Care",
    features: ["Triage • Booking • Dashboard"],
    icon: Stethoscope,
    color: "text-orange-400",
  },
  {
    id: 6,
    title: "Safety",
    features: ["Risk Signals • Escalation"],
    icon: ShieldAlert,
    color: "text-red-400",
  },
  {
    id: 7,
    title: "Administration",
    features: ["Analytics • Audit"],
    icon: BarChart3,
    color: "text-amber-400",
  },
];
