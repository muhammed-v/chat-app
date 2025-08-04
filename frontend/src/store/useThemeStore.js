//save the theme to the local storage, so that everytime you refresh, the theme stays.

import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "coffee",// state
  setTheme: (theme) => { //setter funtion
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));