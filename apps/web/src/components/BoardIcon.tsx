import {
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck,
  Code2,
  MessageSquare,
  UsersRound,
  type LucideIcon
} from "lucide-react";
import type { Board } from "@campustalk/shared";

const icons: Record<string, LucideIcon> = {
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck,
  Code2,
  MessageSquare,
  UsersRound
};

export function BoardIcon({ board }: { board: Board }) {
  const Icon = icons[board.icon] ?? MessageSquare;
  return <Icon aria-hidden="true" size={20} strokeWidth={2} />;
}
