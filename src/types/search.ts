export interface FileMatch {
  path: string;
  title: string | null;
  score: number;
}

export interface ContentMatch {
  path: string;
  title: string | null;
  snippet: string;
  matches: number;
}

