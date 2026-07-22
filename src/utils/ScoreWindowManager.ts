import type { WindowScore } from './musicXmlWindow';

export class ScoreWindowManager {
  private windows: WindowScore[] = [];

  async preload(windows: WindowScore[]) {
    this.windows = windows;
  }

  getWindows() {
    return this.windows;
  }
}
