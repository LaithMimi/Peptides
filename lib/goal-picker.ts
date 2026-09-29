// Tracks whether a visitor has already been shown the first-visit "what are
// you researching?" modal (components/store/goal-picker-modal.tsx), so it
// appears at most once per browser. Safe when storage is blocked: the modal
// simply shows again next time rather than throwing.

const SEEN_KEY = "pepclub.goalPickerSeen";
export const GOAL_PICKER_EVENT = "pepclub:goal-picker-change";

export function readGoalPickerSeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markGoalPickerSeen(): void {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // ignore — the modal will simply show again next time
  }
  window.dispatchEvent(new Event(GOAL_PICKER_EVENT));
}
