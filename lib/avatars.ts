/**
 * Vylos Built-in Avatar Collection
 * Uses DiceBear Lorelei (MIT License - safe for commercial use)
 * Supports priority rendering: ID -> URL -> Default Generated -> Branded Initials
 */

export interface AvatarOption {
  id: string;
  url: string;
}

// Optimized with Lorelei style for a friendly, modern, illustrative feel
export const AVATAR_COLLECTION: AvatarOption[] = [
  { id: "vylos_01", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Felix&backgroundColor=b6e3f4" },
  { id: "vylos_02", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Aneka&backgroundColor=ffdfbf" },
  { id: "vylos_03", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=George&backgroundColor=c0aede" },
  { id: "vylos_04", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Sasha&backgroundColor=d1d4f9" },
  { id: "vylos_05", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Oliver&backgroundColor=b6e3f4" },
  { id: "vylos_06", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Lily&backgroundColor=ffd5dc" },
  { id: "vylos_07", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Midnight&backgroundColor=c0aede" },
  { id: "vylos_08", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Max&backgroundColor=ffdfbf" },
  { id: "vylos_09", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Molly&backgroundColor=d1d4f9" },
  { id: "vylos_10", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Jack&backgroundColor=b6e3f4" },
  { id: "vylos_11", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Aria&backgroundColor=ffd5dc" },
  { id: "vylos_12", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Charlie&backgroundColor=c0aede" },
  { id: "vylos_13", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Pepper&backgroundColor=ffdfbf" },
  { id: "vylos_14", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Mia&backgroundColor=d1d4f9" },
  { id: "vylos_15", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Noah&backgroundColor=b6e3f4" },
  { id: "vylos_16", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Ava&backgroundColor=ffd5dc" },
  { id: "vylos_17", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Leo&backgroundColor=c0aede" },
  { id: "vylos_18", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Isla&backgroundColor=ffdfbf" },
  { id: "vylos_19", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Arthur&backgroundColor=d1d4f9" },
  { id: "vylos_20", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Grace&backgroundColor=b6e3f4" },
  { id: "vylos_21", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Harry&backgroundColor=ffd5dc" },
  { id: "vylos_22", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Sophia&backgroundColor=c0aede" },
  { id: "vylos_23", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Ash&backgroundColor=ffdfbf" },
  { id: "vylos_24", url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Sage&backgroundColor=d1d4f9" },
];

export function getAvatarUrl(idOrUrl: string | undefined, name?: string): string {
  if (!idOrUrl) return `https://api.dicebear.com/9.x/lorelei/svg?seed=${name || "Vylos"}&backgroundColor=b6e3f4`;
  
  // Check if it's a known ID
  const avatar = AVATAR_COLLECTION.find(a => a.id === idOrUrl);
  if (avatar) return avatar.url;

  // If it's already a URL, return it
  if (idOrUrl.startsWith("http")) return idOrUrl;

  // Otherwise treat as a seed for a default avatar
  return `https://api.dicebear.com/9.x/lorelei/svg?seed=${idOrUrl}&backgroundColor=b6e3f4`;
}
