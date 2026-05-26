/**
 * useEmployees — управление списком сотрудников.
 *
 * Фаза 1: хранит данные в localStorage.
 * Фаза 2: если user !== null (кабинет), переключается на API:
 *   заменить useLocalEmployees() на useServerEmployees(user.id).
 *   Схема объекта сотрудника намеренно совпадает с DB-моделью Employee.
 */
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "buhkz_employees";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(employees) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

function makeEmployee(overrides = {}) {
  return {
    id: crypto.randomUUID(),   // в Phase 2 будет приходить из DB
    name: "",
    position: "",
    gross_salary: 0,
    children: 0,
    alimony_children: 0,
    is_active: true,
    ...overrides,
  };
}

function useLocalEmployees() {
  const [employees, setEmployees] = useState(loadFromStorage);

  const save = useCallback((nextOrUpdater) => {
    setEmployees((prev) => {
      const next = typeof nextOrUpdater === "function" ? nextOrUpdater(prev) : nextOrUpdater;
      saveToStorage(next);
      return next;
    });
  }, []);

  const add = useCallback(() => {
    save((prev) => [...prev, makeEmployee()]);
  }, [save]);

  const update = useCallback((id, patch) => {
    save((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, [save]);

  const remove = useCallback((id) => {
    save((prev) => prev.filter((e) => e.id !== id));
  }, [save]);

  const replace = useCallback((list) => {
    save(list);
  }, [save]);

  return { employees, add, update, remove, replace };
}

export function useEmployees() {
  const { user } = useAuth();

  // Phase 2: if (user) return useServerEmployees(user.id);
  return useLocalEmployees();
}

export { makeEmployee };
