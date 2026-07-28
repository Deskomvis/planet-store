export type FavoriteProduct = {
  id: string;
  name: string;
  imageUrl: string | null;
  inStock: boolean;
  categorySlug: string;
  categoryName: string;
};

const STORAGE_KEY = "planet-store-favorites";
const EVENT_NAME = "planet-store-favorites-changed";

// useSyncExternalStore requires getSnapshot to return a stable reference
// when the underlying data hasn't changed, otherwise it re-renders forever.
// Cache the parsed array and only re-read localStorage when we know it
// changed (our own writes, or another tab's via the "storage" event).
let cache: FavoriteProduct[] | null = null;

function readFromStorage(): FavoriteProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(favorites: FavoriteProduct[]) {
  cache = favorites;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function getFavorites(): FavoriteProduct[] {
  if (cache === null) {
    cache = readFromStorage();
  }
  return cache;
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}

/** Adds or removes the product from favorites. Returns the new favorited state. */
export function toggleFavorite(product: FavoriteProduct): boolean {
  const favorites = getFavorites();
  const index = favorites.findIndex((f) => f.id === product.id);

  if (index === -1) {
    write([...favorites, product]);
    return true;
  }

  write(favorites.filter((f) => f.id !== product.id));
  return false;
}

export function removeFavorite(id: string) {
  write(getFavorites().filter((f) => f.id !== id));
}

export function subscribeFavorites(callback: () => void): () => void {
  function handleStorageEvent(e: StorageEvent) {
    if (e.key === STORAGE_KEY) {
      cache = null;
      callback();
    }
  }

  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", handleStorageEvent);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
