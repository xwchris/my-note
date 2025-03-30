import { Note, Stats } from "../types";

export class GitHubStorageService {
  private owner: string;
  private repo: string;
  private branch: string;
  private notesPath: string;
  private statsPath: string;

  constructor(owner: string, repo: string, branch = "main") {
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
    this.notesPath = "data/notes.json";
    this.statsPath = "data/stats.json";
  }

  async readNotes(): Promise<Note[]> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.notesPath}?ref=${this.branch}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // 如果文件不存在，返回空数组
          return [];
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = Buffer.from(data.content, "base64").toString("utf8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to read notes from GitHub:", error);
      throw error;
    }
  }

  async writeNotes(notes: Note[]): Promise<void> {
    try {
      // 首先获取文件的当前 SHA（如果存在）
      let sha: string | undefined;
      try {
        const response = await fetch(
          `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.notesPath}?ref=${this.branch}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          sha = data.sha;
        }
      } catch (error) {
        // 如果文件不存在，继续创建
      }

      // 更新或创建文件
      const content = Buffer.from(JSON.stringify(notes, null, 2)).toString(
        "base64"
      );
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.notesPath}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "Update notes",
            content,
            branch: this.branch,
            sha: sha,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to write notes to GitHub:", error);
      throw error;
    }
  }

  async readStats(): Promise<Stats> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.statsPath}?ref=${this.branch}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // 如果文件不存在，返回默认统计数据
          return { activityData: [], totalDays: 0 };
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = Buffer.from(data.content, "base64").toString("utf8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to read stats from GitHub:", error);
      throw error;
    }
  }

  async writeStats(stats: Stats): Promise<void> {
    try {
      // 首先获取文件的当前 SHA（如果存在）
      let sha: string | undefined;
      try {
        const response = await fetch(
          `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.statsPath}?ref=${this.branch}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          sha = data.sha;
        }
      } catch (error) {
        // 如果文件不存在，继续创建
      }

      // 更新或创建文件
      const content = Buffer.from(JSON.stringify(stats, null, 2)).toString(
        "base64"
      );
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.statsPath}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "Update stats",
            content,
            branch: this.branch,
            sha: sha,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to write stats to GitHub:", error);
      throw error;
    }
  }
}
