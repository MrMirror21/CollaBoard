/* eslint-disable class-methods-use-this */
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// ResizeObserver 모킹 (headlessui/react 컴포넌트에서 사용)
class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});
