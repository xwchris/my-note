import { Note, Stats } from "@/types";
import { GitHubStorageService } from "@/services/GitHubStorageService";

const githubStorage = new GitHubStorageService(
  process.env.GITHUB_OWNER || "",
  process.env.GITHUB_REPO || "",
  process.env.GITHUB_BRANCH || "main"
);

export async function readNotes(): Promise<Note[]> {
  return await githubStorage.readNotes();
}

export async function writeNotes(notes: Note[]) {
  await githubStorage.writeNotes(notes);
}

export async function readStats(): Promise<Stats> {
  return await githubStorage.readStats();
}

export async function writeStats(stats: Stats) {
  await githubStorage.writeStats(stats);
}

export async function updateActivityStats(notes: Note[]): Promise<Stats> {
  const days = 14;
  const today = new Date();
  const activityData = [];
  const uniqueDays = new Set();

  notes.forEach((note) => {
    if (note.deleted === 0) {
      uniqueDays.add(new Date(note.createdAt).toISOString().split("T")[0]);
    }
  });

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const count = notes.filter((note) => {
      const noteDate = new Date(note.createdAt).toISOString().split("T")[0];
      return noteDate === dateStr && note.deleted === 0;
    }).length;

    activityData.push({ date: dateStr, count });
  }

  const stats = {
    activityData,
    totalDays: uniqueDays.size,
  };

  await writeStats(stats);
  return stats;
}
