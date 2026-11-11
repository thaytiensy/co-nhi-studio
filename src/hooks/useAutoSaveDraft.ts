"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Slide, DraftRecord } from '../types/presentation.ts';
import { getScopedStorageKey } from '../utils/userWorkspaceService.js';

export interface UseAutoSaveDraftOptions {
  slides: Slide[];
  title: string;
  userEmail?: string;
  enabled?: boolean;
  debounceMs?: number;
}

export type AutoSaveStatus = 'idle' | 'saving' | 'saved';

export function useAutoSaveDraft({
  slides,
  title,
  userEmail = 'default',
  enabled = true,
  debounceMs = 800
}: UseAutoSaveDraftOptions) {
  const [saveStatus, setSaveStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const draftKey = getScopedStorageKey('conhi_autosave_draft_v2');

  const saveDraft = useCallback(() => {
    if (typeof window === 'undefined' || !enabled || slides.length === 0) return;

    try {
      setSaveStatus('saving');
      const draft: DraftRecord = {
        id: `draft-${Date.now()}`,
        timestamp: Date.now(),
        title,
        slides,
        userEmail,
        version: '2.0.0'
      };

      localStorage.setItem(draftKey, JSON.stringify(draft));
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(nowStr);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('idle');
    }
  }, [draftKey, enabled, slides, title, userEmail]);

  useEffect(() => {
    if (!enabled || slides.length === 0) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setSaveStatus('saving');
    timeoutRef.current = setTimeout(() => {
      saveDraft();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [slides, title, enabled, debounceMs, saveDraft]);

  const clearDraft = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(draftKey);
      }
      setSaveStatus('idle');
      setLastSavedTime('');
    } catch {
      // Bỏ qua lỗi
    }
  }, [draftKey]);

  return {
    saveStatus,
    lastSavedTime,
    clearDraft,
    forceSave: saveDraft
  };
}
