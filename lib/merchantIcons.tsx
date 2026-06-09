import React from 'react';
import { 
  Coffee, ShoppingBag, Globe, Car, Briefcase, 
  Play, Utensils, Zap, Receipt, Home, 
  Heart, PiggyBank, Circle, Music, Video,
  CreditCard, Smartphone, ShoppingCart, Truck,
  ShieldCheck, Landmark, Flame, DollarSign,
  Tv, Wifi, Smartphone as Phone, Gift, Store
} from 'lucide-react';

export interface MerchantLogo {
  id: string;
  keywords: string[];
  icon: React.ReactNode;
  bg: string;
}

export const MERCHANT_LOGOS: MerchantLogo[] = [
  // Streaming / Subscriptions
  { id: 'netflix', keywords: ['netflix'], icon: <Video size={18} />, bg: 'bg-black text-red-600' },
  { id: 'spotify', keywords: ['spotify'], icon: <Music size={18} />, bg: 'bg-[#1DB954] text-black' },
  { id: 'youtube', keywords: ['youtube', 'yt music', 'google *youtube'], icon: <Play size={18} />, bg: 'bg-white text-red-600' },
  { id: 'disney', keywords: ['disney', 'disney+'], icon: <Video size={18} />, bg: 'bg-[#006E99] text-white' },
  { id: 'amazon', keywords: ['amazon', 'prime'], icon: <ShoppingBag size={18} />, bg: 'bg-[#FF9900] text-black' },
  
  // Food
  { id: 'kfc', keywords: ['kfc'], icon: <Utensils size={18} />, bg: 'bg-[#A3080C] text-white' },
  { id: 'mcdonalds', keywords: ['mcdonald', 'mcdonalds'], icon: <Utensils size={18} />, bg: 'bg-[#FFBC0D] text-[#DA291C]' },
  { id: 'nandos', keywords: ['nandos'], icon: <Utensils size={18} />, bg: 'bg-black text-[#E51B24]' },
  { id: 'burger-king', keywords: ['burger king'], icon: <Utensils size={18} />, bg: 'bg-[#F5EBDC] text-[#D62300]' },
  
  // Transport / Fuel
  { id: 'uber', keywords: ['uber'], icon: <Car size={18} />, bg: 'bg-black text-white' },
  { id: 'bolt', keywords: ['bolt'], icon: <Car size={18} />, bg: 'bg-[#34D399] text-white' },
  { id: 'shell', keywords: ['shell'], icon: <Flame size={18} />, bg: 'bg-[#FFD500] text-[#EE1C25]' },
  { id: 'engen', keywords: ['engen'], icon: <Flame size={18} />, bg: 'bg-[#00529B] text-white' },
  
  // Retail / Groceries
  { id: 'checkers', keywords: ['checkers'], icon: <ShoppingBag size={18} />, bg: 'bg-[#004A99] text-white' },
  { id: 'woolworths', keywords: ['woolworths', 'woolies'], icon: <ShoppingBag size={18} />, bg: 'bg-black text-white' },
  { id: 'pick-n-pay', keywords: ['pick n pay', 'pnp'], icon: <ShoppingBag size={18} />, bg: 'bg-[#E30613] text-white' },
  { id: 'shoprite', keywords: ['shoprite'], icon: <ShoppingBag size={18} />, bg: 'bg-[#E30613] text-white' },
  { id: 'takealot', keywords: ['takealot'], icon: <ShoppingCart size={18} />, bg: 'bg-[#00A9E0] text-white' },

  // Tech / Services
  { id: 'apple', keywords: ['apple', 'icloud', 'itunes'], icon: <Smartphone size={18} />, bg: 'bg-black text-white' },
  { id: 'google', keywords: ['google', 'gsuite', 'google one'], icon: <Globe size={18} />, bg: 'bg-white text-blue-500' },
  
  // Banking
  { id: 'fnb', keywords: ['fnb', 'first national bank'], icon: <Landmark size={18} />, bg: 'bg-[#009B91] text-white' },
  { id: 'capitec', keywords: ['capitec'], icon: <Landmark size={18} />, bg: 'bg-[#003B5C] text-[#E30613]' },
  { id: 'standard-bank', keywords: ['standard bank'], icon: <Landmark size={18} />, bg: 'bg-[#0033A1] text-white' },

  // Bills
  { id: 'eskom', keywords: ['eskom'], icon: <Zap size={18} />, bg: 'bg-white text-blue-800' },
  { id: 'dstv', keywords: ['dstv', 'multichoice'], icon: <Tv size={18} />, bg: 'bg-[#00A9E0] text-white' },
  { id: 'vodacom', keywords: ['vodacom'], icon: <Phone size={18} />, bg: 'bg-[#E60000] text-white' },
  { id: 'mtn', keywords: ['mtn'], icon: <Phone size={18} />, bg: 'bg-[#FFCC00] text-black' },
];

const Sparkles = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

export const CATEGORY_ICONS: Record<string, { icon: React.ReactNode; bg: string }> = {
  'Groceries': { icon: <ShoppingBag size={18} />, bg: 'bg-emerald-50 text-emerald-600' },
  'Food & Dining': { icon: <Utensils size={18} />, bg: 'bg-orange-50 text-orange-600' },
  'Dining': { icon: <Utensils size={18} />, bg: 'bg-orange-50 text-orange-600' },
  'Transport': { icon: <Car size={18} />, bg: 'bg-blue-50 text-blue-600' },
  'Travel': { icon: <Globe size={18} />, bg: 'bg-cyan-50 text-cyan-600' },
  'Entertainment': { icon: <Video size={18} />, bg: 'bg-purple-50 text-purple-600' },
  'Subscriptions': { icon: <Play size={18} />, bg: 'bg-red-50 text-red-600' },
  'Bills': { icon: <Receipt size={18} />, bg: 'bg-amber-50 text-amber-600' },
  'Utilities': { icon: <Zap size={18} />, bg: 'bg-yellow-50 text-yellow-600' },
  'Rent / Housing': { icon: <Home size={18} />, bg: 'bg-indigo-50 text-indigo-600' },
  'Housing': { icon: <Home size={18} />, bg: 'bg-indigo-50 text-indigo-600' },
  'Health': { icon: <Heart size={18} />, bg: 'bg-rose-50 text-rose-600' },
  'Medical': { icon: <Heart size={18} />, bg: 'bg-rose-50 text-rose-600' },
  'Shopping': { icon: <ShoppingCart size={18} />, bg: 'bg-pink-50 text-pink-600' },
  'Income': { icon: <DollarSign size={18} />, bg: 'bg-emerald-50 text-emerald-600' },
  'Salary': { icon: <Briefcase size={18} />, bg: 'bg-teal-50 text-teal-600' },
  'Savings': { icon: <PiggyBank size={18} />, bg: 'bg-sky-50 text-sky-600' },
  'Insurance': { icon: <ShieldCheck size={18} />, bg: 'bg-slate-50 text-slate-600' },
  'Personal Care': { icon: <Sparkles size={18} />, bg: 'bg-violet-50 text-violet-600' },
  'Education': { icon: <Store size={18} />, bg: 'bg-blue-50 text-blue-600' },
  'Gifts': { icon: <Gift size={18} />, bg: 'bg-red-50 text-red-600' },
  'Business': { icon: <Briefcase size={18} />, bg: 'bg-slate-800 text-white' },
  'Other': { icon: <Circle size={18} />, bg: 'bg-slate-50 text-slate-400' },
};

export function getTransactionIcon(merchant: string, category: string, type: 'income' | 'expense' = 'expense') {
  const m = (merchant || "").toLowerCase();
  
  // 1. Check Merchant Logos
  const merchantMatch = MERCHANT_LOGOS.find(ml => 
    ml.keywords.some(k => m.includes(k.toLowerCase()))
  );
  
  if (merchantMatch) {
    return {
      icon: merchantMatch.icon,
      bg: merchantMatch.bg,
      id: merchantMatch.id
    };
  }
  
  // 2. Check for Specific Keywords even if not in Merchant Logos
  if (m.includes('fuel') || m.includes('petrol') || m.includes('astron') || m.includes('totalenergies') || m.includes('caltex') || m.includes('sasol') || m.includes('bp')) {
    return { icon: <Flame size={18} />, bg: 'bg-orange-600 text-white' };
  }

  // 3. Fallback to Category
  const catIcon = CATEGORY_ICONS[category] || CATEGORY_ICONS['Other'];
  
  // 4. Handle Income specific fallback
  if (type === 'income' && category === 'Other') {
    return CATEGORY_ICONS['Income'];
  }

  return catIcon;
}
