/**
 * @module shared/utils/draftStorage
 * @description Helper untuk auto-save draft kuisoner & observasi ke localStorage
 */

export interface DraftItem<T> {
  key: string;
  data: T;
  step: number;
  lastUpdated: string;
}

export const saveDraft = <T>(key: string, data: T, step: number = 0): void => {
  try {
    const draft: DraftItem<T> = {
      key,
      data,
      step,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(`bsan_draft_${key}`, JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save draft to localStorage:', error);
  }
};

export const getDraft = <T>(key: string): DraftItem<T> | null => {
  try {
    const item = localStorage.getItem(`bsan_draft_${key}`);
    if (!item) return null;
    return JSON.parse(item) as DraftItem<T>;
  } catch (error) {
    console.error('Failed to parse draft from localStorage:', error);
    return null;
  }
};

export const clearDraft = (key: string): void => {
  try {
    localStorage.removeItem(`bsan_draft_${key}`);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
};

export const hasDraft = (key: string): boolean => {
  return localStorage.getItem(`bsan_draft_${key}`) !== null;
};
