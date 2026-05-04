import {
  UtensilsCrossed, Sun, Soup, Moon, Cookie,
  Flame, Coffee, Apple, Zap, Pizza, Star, Heart,
  LucideIcon,
} from 'lucide-react'

// ── Icon map for meal icons ───────────────────────────────────────────
export const MEAL_ICONS: Record<string, LucideIcon> = {
  sun:      Sun,
  soup:     Soup,
  moon:     Moon,
  cookie:   Cookie,
  coffee:   Coffee,
  apple:    Apple,
  zap:      Zap,
  pizza:    Pizza,
  star:     Star,
  heart:    Heart,
  utensils: UtensilsCrossed,
  flame:    Flame,
}

export const ICON_OPTIONS = Object.keys(MEAL_ICONS)
