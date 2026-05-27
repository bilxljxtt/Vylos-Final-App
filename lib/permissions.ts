import { UserProfile } from "./store";

export type FeatureName = 
  | 'manual_transactions'
  | 'basic_dashboard'
  | 'budgets'
  | 'goals'
  | 'advanced_reports'
  | 'transaction_imports'
  | 'ai_advisor'
  | 'business_tools'
  | 'team_features'
  | 'reminders';

export type AIUsageLimit = 'none' | 'limited' | 'medium' | 'high' | 'unlimited';

interface TierFeatures {
  features: Record<FeatureName, boolean | 'limited'>;
  aiLimit: AIUsageLimit;
  aiMonthlyLimit: number;
}

const TIER_CONFIG: Record<UserProfile['subscription_tier'], TierFeatures> = {
  free: {
    features: {
      manual_transactions: true,
      basic_dashboard: true,
      budgets: true,
      goals: true,
      advanced_reports: false,
      transaction_imports: 'limited',
      ai_advisor: true,
      business_tools: false,
      team_features: false,
      reminders: false,
    },
    aiLimit: 'limited',
    aiMonthlyLimit: 0,
  },
  individual: {
    features: {
      manual_transactions: true,
      basic_dashboard: true,
      budgets: true,
      goals: true,
      advanced_reports: true,
      transaction_imports: true,
      ai_advisor: true,
      business_tools: false,
      team_features: false,
      reminders: false,
    },
    aiLimit: 'limited',
    aiMonthlyLimit: 30,
  },
  entrepreneur: {
    features: {
      manual_transactions: true,
      basic_dashboard: true,
      budgets: true,
      goals: true,
      advanced_reports: true,
      transaction_imports: true,
      ai_advisor: true,
      business_tools: true,
      team_features: false,
      reminders: true,
    },
    aiLimit: 'medium',
    aiMonthlyLimit: 100,
  },
  business: {
    features: {
      manual_transactions: true,
      basic_dashboard: true,
      budgets: true,
      goals: true,
      advanced_reports: true,
      transaction_imports: true,
      ai_advisor: true,
      business_tools: true,
      team_features: true,
      reminders: true,
    },
    aiLimit: 'high',
    aiMonthlyLimit: 300,
  },
  internal: {
    features: {
      manual_transactions: true,
      basic_dashboard: true,
      budgets: true,
      goals: true,
      advanced_reports: true,
      transaction_imports: true,
      ai_advisor: true,
      business_tools: true,
      team_features: true,
      reminders: true,
    },
    aiLimit: 'unlimited',
    aiMonthlyLimit: 9999,
  },
};

export class Permissions {
  /**
   * Check if a user is an admin or founder.
   */
  static isPrivileged(user: UserProfile): boolean {
    return user.role === 'admin' || user.role === 'founder' || user.is_internal_user === true || user.subscription_tier === 'internal';
  }

  /**
   * Check if a user has access to a specific feature.
   */
  static hasFeature(user: UserProfile, feature: FeatureName): boolean {
    if (this.isPrivileged(user)) return true;
    
    const tier = TIER_CONFIG[user.subscription_tier] || TIER_CONFIG.free;
    const access = tier.features[feature];
    
    return access === true || access === 'limited';
  }

  /**
   * Helper for general AI access gating (subscription & rules)
   */
  static canUseAI(user: UserProfile): boolean {
    // Admin/developer/internal testing users: AI access allowed
    if (this.isPrivileged(user) || user.role === 'tester') {
      return true;
    }

    // Free trial users: no AI access unless explicitly allowed by admin rule
    if (user.subscription_status === 'trialing') {
      return !!user.onboardingAnswers?.allowTrialAI || !!(user as any).allow_trial_ai;
    }

    // Free users: now allowed with daily limit
    return true;
  }

  /**
   * Helper for AI Advisor access
   */
  static canUseAIAdvisor(user: UserProfile): boolean {
    return this.canUseAI(user);
  }

  /**
   * Helper for Transaction Imports
   */
  static canImportTransactions(user: UserProfile): boolean {
    return this.hasFeature(user, 'transaction_imports');
  }

  /**
   * Helper for Business Tools
   */
  static canAccessBusinessTools(user: UserProfile): boolean {
    return this.hasFeature(user, 'business_tools');
  }

  /**
   * Helper for Advanced Reports
   */
  static canAccessAdvancedReports(user: UserProfile): boolean {
    return this.hasFeature(user, 'advanced_reports');
  }

  /**
   * Helper for Team Features
   */
  static canUseTeamFeatures(user: UserProfile): boolean {
    return this.hasFeature(user, 'team_features');
  }

  /**
   * Helper for Internal User check
   */
  static isInternalUser(user: UserProfile): boolean {
    return this.isPrivileged(user);
  }

  /**
   * Get AI Usage limit
   */
  static getAILimit(user: UserProfile): AIUsageLimit {
    if (this.isPrivileged(user)) return 'unlimited';
    return TIER_CONFIG[user.subscription_tier]?.aiLimit || 'none';
  }

  /**
   * Get AI Monthly Limit count
   */
  static getAIMonthlyLimit(user: UserProfile): number {
    if (this.isPrivileged(user)) return 9999;
    return TIER_CONFIG[user.subscription_tier]?.aiMonthlyLimit || 0;
  }
}
