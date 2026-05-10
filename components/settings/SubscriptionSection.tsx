import React from 'react';
import { UserProfile } from '@/lib/store';
import { Permissions } from '@/lib/permissions';
import { Shield, Crown, Zap, User, ExternalLink } from 'lucide-react';

interface SubscriptionSectionProps {
  user: UserProfile;
  aiUsage?: { messages_used: number; billing_month: string };
}

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({ user, aiUsage }) => {
  const isInternal = Permissions.isInternalUser(user);
  const monthlyLimit = Permissions.getAIMonthlyLimit(user);
  const messagesUsed = aiUsage?.messages_used || 0;
  
  const tierLabels: Record<UserProfile['subscription_tier'], string> = {
    free: 'Free Plan',
    individual: 'Individual Pro',
    entrepreneur: 'Entrepreneur',
    business: 'Business',
    internal: 'Internal Vylos Access'
  };

  const getTierIcon = () => {
    switch (user.subscription_tier) {
      case 'internal': return <Shield className="w-5 h-5 text-amber-500" />;
      case 'business': return <Crown className="w-5 h-5 text-purple-500" />;
      case 'entrepreneur': return <Zap className="w-5 h-5 text-blue-500" />;
      case 'individual': return <Crown className="w-5 h-5 text-green-500" />;
      default: return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Subscription & Access</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                {getTierIcon()}
              </div>
              <div>
                <p className="text-sm text-white/60">Current Plan</p>
                <h4 className="text-xl font-bold text-white capitalize">{tierLabels[user.subscription_tier]}</h4>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                user.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {user.subscription_status}
              </span>
            </div>
          </div>

          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-white/40 uppercase tracking-widest">AI Advisor Usage</p>
              <p className="text-xs font-bold text-white/60">
                {isInternal ? 'Unlimited' : `${messagesUsed} / ${monthlyLimit} messages`}
              </p>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${messagesUsed >= monthlyLimit && !isInternal ? 'bg-red-500' : 'bg-primary'}`}
                style={{ width: isInternal ? '100%' : `${Math.min((messagesUsed / monthlyLimit) * 100, 100)}%` }}
              />
            </div>
            {!isInternal && (
              <p className="text-[10px] text-white/30 italic">
                Credits reset on the 1st of each month.
              </p>
            )}
          </div>

          {isInternal ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-500">Internal Team Access</p>
                  <p className="text-xs text-amber-200/70 mt-1">
                    You have internal Vylos team access. All premium features are unlocked for testing and development.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {user.subscription_tier === 'free' ? (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-200/80">
                    You are currently on the Free plan. Upgrade to unlock AI Advisor, transaction imports, and advanced reports.
                  </p>
                  <button className="mt-3 flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
                    View Upgrade Options <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-xs text-white/60">
                    Your {tierLabels[user.subscription_tier]} provides access to premium features. 
                    {user.subscription_expires_at && ` Renews on ${new Date(user.subscription_expires_at).toLocaleDateString()}.`}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">User Role</p>
              <p className="text-sm text-white/80 font-medium capitalize mt-1">{user.role}</p>
            </div>
            {user.payment_provider && (
              <div className="text-right">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Billed via</p>
                <p className="text-sm text-white/80 font-medium capitalize mt-1">{user.payment_provider}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
