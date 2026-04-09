import { useCallback } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

const FOCUSABLE_SELECTOR =
  'input:not([type="hidden"]), select, textarea, button, [tabindex]:not([tabindex="-1"])';

function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }
  return element.getClientRects().length > 0;
}

function isEnabled(element: HTMLElement): boolean {
  if (element.hasAttribute("disabled")) return false;
  if (element.getAttribute("aria-disabled") === "true") return false;
  if (element.closest("[hidden], [aria-hidden='true'], [inert]")) return false;
  return true;
}

function isSubmitControl(element: HTMLElement): boolean {
  if (element instanceof HTMLButtonElement) {
    return element.type === "submit";
  }

  if (element instanceof HTMLInputElement) {
    return element.type === "submit";
  }

  const closestButton = element.closest("button, input");
  if (closestButton instanceof HTMLButtonElement) {
    return closestButton.type === "submit";
  }
  if (closestButton instanceof HTMLInputElement) {
    return closestButton.type === "submit";
  }

  return false;
}

function getTabOrderElements(form: HTMLFormElement): HTMLElement[] {
  const elements = Array.from(
    form.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => isVisible(element) && isEnabled(element));

  return [...elements].sort((a, b) => {
    const aTab = a.tabIndex;
    const bTab = b.tabIndex;
    const aPositive = aTab > 0;
    const bPositive = bTab > 0;

    if (aPositive && bPositive) return aTab - bTab;
    if (aPositive) return -1;
    if (bPositive) return 1;
    return 0;
  });
}

export function useEnterKeyNext() {
  return useCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter") return;
    if (event.defaultPrevented) return;
    if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const nativeEvent = event.nativeEvent;
    if (nativeEvent.isComposing) return;

    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const form = target.closest("form");
    if (!(form instanceof HTMLFormElement)) return;

    const current =
      target.closest<HTMLElement>(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
      ) ?? target;

    if (isSubmitControl(current)) {
      return;
    }

    const focusable = getTabOrderElements(form);
    if (focusable.length === 0) return;

    const currentIndex = focusable.indexOf(current);
    if (currentIndex < 0) return;

    const next = focusable[currentIndex + 1];
    event.preventDefault();

    if (next) {
      next.focus();
      if (next instanceof HTMLInputElement && next.type !== "checkbox") {
        next.select();
      }
    }
  }, []);
}
