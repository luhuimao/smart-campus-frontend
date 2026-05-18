"use client";

import { createContext, useContext } from "react";
import type { WecomUser } from "@/lib/wecom-auth";

export const UserContext = createContext<WecomUser | null>(null);

export function useCurrentUser(): WecomUser | null {
  return useContext(UserContext);
}

export function UserProvider({
  value,
  children,
}: {
  value: WecomUser | null;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
