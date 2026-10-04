export type QuestionType = "choice" | "noul" | "score";

/** Tools this extension owns. Never offered as router candidates and toggled together. */
export const JEV_TOOL_NAMES = ["jev_find_tools", "jev_find_skill", "jev_evaluate", "jev_browse"] as const;

export function isJevTool(name: string): boolean {
  return (JEV_TOOL_NAMES as readonly string[]).includes(name);
}

const STOPWORDS: Record<string, true> = {
  the: true, and: true, for: true, with: true, this: true, that: true, from: true, into: true, what: true,
  how: true, can: true, you: true, please: true, then: true, are: true, was: true, its: true, our: true,
  your: true, use: true, make: true, about: true,
};
/** Explicit web addresses only; bare `name.ext` would match file names like `index.ts`. */
const URL_TOKEN = /\b(?:https?:\/\/|www\.)\S+/gi;
/** Prompts that need the web; Jev routing runs for these by default (benchmarked faster). */
export const WEB_TASK = /\b(?:https?:\/\/|www\.)\S+|\b(?:browse|browsing|browser|screenshot|website|webpage|web page|scrape|navigate to)\b/i;

/**
 * Keyword terms for local shortlisting. Raw URLs become web terms instead of
 * "https"/"com" fragments, and short/stop words are dropped: they match nearly
 * every description and push real candidates out of the shortlist.
 */
export function queryTerms(query: string): string[] {
  const stripped = query.replace(URL_TOKEN, " ");
  const terms = stripped.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !STOPWORDS[w]);
  if (stripped !== query) terms.push("browse", "web", "website");
  return [...new Set(terms)];
}

export interface BaseQuestionConfig {
  instructions: string;
}

export interface ChoiceQuestionConfig extends BaseQuestionConfig {
  type: "choice";
  criteria: Record<string, string | null>;
}

export interface NoulQuestionConfig extends BaseQuestionConfig {
  type: "noul";
  criteria?: string;
}

export interface ScoreQuestionConfig extends BaseQuestionConfig {
  type: "score";
  criteria: string[];
}

export type QuestionConfig = ChoiceQuestionConfig | NoulQuestionConfig | ScoreQuestionConfig;

export interface JevEvaluationRequest {
  state: Record<string, unknown> | string;
  questions: Record<string, QuestionConfig>;
  model?: string;
}

export interface JevAnswerResult {
  type: QuestionType;
  value: string | number | boolean;
  confidence?: number;
  distribution?: Record<string, number>;
  raw?: unknown;
}

export interface JevEvaluationResponse {
  answers: Record<string, JevAnswerResult>;
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  elapsedMs: number;
}

export interface JevSessionStats {
  requestsCount: number;
  totalTokens: number;
  lastElapsedMs?: number;
  lastError?: string;
}
