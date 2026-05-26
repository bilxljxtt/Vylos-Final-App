"use client";

import React from "react";
import { 
  Target, Shield, Car, Home, Plane, GraduationCap, 
  Heart, Baby, Rocket, Building, CreditCard, Laptop, 
  Smartphone, Layout, Users, HelpCircle 
} from "lucide-react";

interface GoalIconProps {
  iconName?: string;
  size?: number;
  className?: string;
}

// Map legacy emoji icons stored in existing Supabase databases to clean Lucide icon names
const EMOJI_TO_LUCIDE_MAP: Record<string, string> = {
  "🎯": "Target",
  "🛡️": "Shield",
  "🛟": "Shield",
  "🚗": "Car",
  "🏠": "Home",
  "🏝️": "Plane",
  "✈️": "Plane",
  "🏖️": "Plane",
  "🎓": "GraduationCap",
  "💍": "Heart",
  "❤️": "Heart",
  "🍼": "Baby",
  "👶": "Baby",
  "🚀": "Rocket",
  "🏢": "Building",
  "💼": "Briefcase",
  "💳": "CreditCard",
  "💰": "CreditCard",
  "💸": "CreditCard",
  "💻": "Laptop",
  "📱": "Smartphone",
  "🛋️": "Home",
  "👪": "Users",
  "🧓": "Users",
  "📈": "Target",
  "⚡": "Shield",
  "📦": "Target"
};

export const GoalIcon: React.FC<GoalIconProps> = ({ 
  iconName = "Target", 
  size = 24, 
  className = "" 
}) => {
  // Translate emoji to name if applicable
  let name = iconName.trim();
  if (EMOJI_TO_LUCIDE_MAP[name]) {
    name = EMOJI_TO_LUCIDE_MAP[name];
  }

  const iconNameLower = name.toLowerCase();

  switch (iconNameLower) {
    case "target":
      return <Target size={size} className={className} />;
    case "shield":
      return <Shield size={size} className={className} />;
    case "car":
      return <Car size={size} className={className} />;
    case "home":
      return <Home size={size} className={className} />;
    case "plane":
      return <Plane size={size} className={className} />;
    case "graduationcap":
      return <GraduationCap size={size} className={className} />;
    case "heart":
      return <Heart size={size} className={className} />;
    case "baby":
      return <Baby size={size} className={className} />;
    case "rocket":
      return <Rocket size={size} className={className} />;
    case "building":
      return <Building size={size} className={className} />;
    case "briefcase":
      return <Building size={size} className={className} />; // Fallback to Building for briefcase
    case "creditcard":
      return <CreditCard size={size} className={className} />;
    case "laptop":
      return <Laptop size={size} className={className} />;
    case "smartphone":
      return <Smartphone size={size} className={className} />;
    case "layout":
      return <Layout size={size} className={className} />;
    case "users":
      return <Users size={size} className={className} />;
    default:
      return <Target size={size} className={className} />;
  }
};
