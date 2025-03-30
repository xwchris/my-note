import { Note } from "../types";

export function getActivityData(
  notes: Note[]
): { date: string; count: number }[] {
  const days = 14; // Show last 14 days of activity
  const today = new Date();
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const count = notes.filter((note) => {
      const noteDate = new Date(note.createdAt).toISOString().split("T")[0];
      return noteDate === dateStr;
    }).length;

    data.push({ date: dateStr, count });
  }

  return data;
}
