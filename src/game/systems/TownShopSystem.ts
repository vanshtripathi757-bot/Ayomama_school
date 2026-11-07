import type { MissionProgressState } from '../../types/game';

export interface TownShopItem {
  id: string;
  shopId: 'manga-shop' | 'konbini';
  name: string;
  description: string;
  priceCp: number;
}

export const TOWN_SHOP_ITEMS: TownShopItem[] = [
  { id: 'manga-volume-01', shopId: 'manga-shop', name: 'Hoshino Manga Vol. 1', description: 'A locally published campus mystery comic.', priceCp: 15 },
  { id: 'campus-sketchbook', shopId: 'manga-shop', name: 'Campus Sketchbook', description: 'A blank sketchbook for academy memories.', priceCp: 20 },
  { id: 'festival-postcard', shopId: 'manga-shop', name: 'Festival Postcard', description: 'A keepsake from the cultural festival.', priceCp: 8 },
  { id: 'bottled-water', shopId: 'konbini', name: 'Bottled Water', description: 'A simple refreshment for the walk back.', priceCp: 5 },
  { id: 'onigiri', shopId: 'konbini', name: 'Onigiri', description: 'A wrapped rice snack from the convenience store.', priceCp: 8 },
  { id: 'sports-drink', shopId: 'konbini', name: 'Sports Drink', description: 'A bottled drink for after-school activities.', priceCp: 10 },
];

export function getTownShopItems(shopId: TownShopItem['shopId']): TownShopItem[] {
  return TOWN_SHOP_ITEMS.filter((item) => item.shopId === shopId);
}

export function getOwnedTownItemIds(inventoryItems: string[] = []): string[] {
  return inventoryItems
    .filter((item) => item.startsWith('town-item:'))
    .map((item) => item.slice('town-item:'.length));
}

export function purchaseTownItem(
  progress: MissionProgressState,
  itemId: string
): { progress: MissionProgressState; success: boolean; reason: 'purchased' | 'unknown-item' | 'already-owned' | 'insufficient-cp' } {
  const item = TOWN_SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item) return { progress, success: false, reason: 'unknown-item' };
  const inventoryItems = [...(progress.inventoryItems ?? [])];
  if (inventoryItems.includes(`town-item:${itemId}`)) {
    return { progress, success: false, reason: 'already-owned' };
  }
  const balance = progress.cpPoints ?? 0;
  if (balance < item.priceCp) {
    return { progress, success: false, reason: 'insufficient-cp' };
  }
  return {
    progress: {
      ...progress,
      cpPoints: balance - item.priceCp,
      inventoryItems: [...inventoryItems, `town-item:${itemId}`],
    },
    success: true,
    reason: 'purchased',
  };
}
