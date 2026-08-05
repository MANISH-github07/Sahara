import { Lock, Bot, HeartHandshake, ShieldCheck } from "lucide-react";

export const TRUST_POINTS = [
  {
    id: 1,
    title: "Privacy First",
    description:
      "Your wellness information is protected with secure authentication and privacy-focused design.",
    badge: "End-to-End Security",
    icon: Lock,
  },
  {
    id: 2,
    title: "Responsible AI",
    description:
      "AI provides guidance while encouraging professional care whenever appropriate.",
    badge: "Human Oversight",
    icon: Bot,
  },
  {
    id: 3,
    title: "Human-Centered Care",
    description:
      "Evidence-based screening and qualified mental health professionals support your wellness journey.",
    badge: "Clinical Approach",
    icon: HeartHandshake,
  },
  {
    id: 4,
    title: "Secure Platform",
    description:
      "Role-based access control, consent management and secure authentication protect every account.",
    badge: "Protected Access",
    icon: ShieldCheck,
  },
];
