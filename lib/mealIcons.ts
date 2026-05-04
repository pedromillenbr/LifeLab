import {
  Sun, Soup, Moon, Cookie, Coffee, Apple,
  Zap, Pizza, Star, Heart, UtensilsCrossed, Flame,
  type LucideIcon,
} from 'lucide-react'

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
