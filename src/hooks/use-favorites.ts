"use client";

import { useSyncExternalStore } from "react";
import { getFavorites, subscribeFavorites, type FavoriteProduct } from "@/lib/favorites";

const EMPTY: FavoriteProduct[] = [];

export function useFavorites(): FavoriteProduct[] {
  return useSyncExternalStore(subscribeFavorites, getFavorites, () => EMPTY);
}
