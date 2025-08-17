
export interface MockRepository {
  [filePath: string]: string;
}

export interface FileSummary {
  path: string;
  summary: string;
}
