import React from 'react';
import { Users, BookOpen, UserPlus, Calendar, Star } from 'lucide-react';
import { GitHubUserDetail, SortOption } from '../types';

interface UserProfileStatsProps {
  user: GitHubUserDetail;
  sortBy: SortOption;
  className?: string;
  flat?: boolean;
}

const StatBox = ({ 
  label, 
  value, 
  icon: Icon, 
  highlight = false 
}: { 
  label: string, 
  value: string | number, 
  icon?: React.ElementType, 
  highlight?: boolean 
}) => (
  <div className={`flex flex-col items-center justify-center py-3 px-1 h-full transition-colors relative ${highlight ? 'bg-blue-50/50' : ''}`}>
    
    <span className={`text-sm sm:text-base font-semibold leading-none ${highlight ? 'text-apple-blue' : 'text-apple-text'}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </span>
    
    <div className="flex items-center gap-1.5 mt-1.5">
      {Icon && <Icon size={12} className={highlight ? 'text-apple-blue' : 'text-gray-400'} />}
      <span className={`text-[10px] uppercase font-medium tracking-wide ${highlight ? 'text-apple-blue' : 'text-apple-gray'}`}>
        {label}
      </span>
    </div>
  </div>
);

export const UserProfileStats: React.FC<UserProfileStatsProps> = ({ user, sortBy, className = '', flat = false }) => {
  return (
    <div className={`grid grid-cols-5 divide-x divide-gray-100 ${flat ? '' : 'bg-gray-50 rounded-xl border border-gray-100'} overflow-hidden h-full ${className}`}>
      <StatBox 
        label="Repos" 
        value={user.public_repos} 
        icon={BookOpen}
        highlight={sortBy === SortOption.REPOS} 
      />
      <StatBox 
        label="Followers" 
        value={user.followers} 
        icon={Users}
        highlight={sortBy === SortOption.FOLLOWERS} 
      />
      <StatBox 
        label="Following" 
        value={user.following} 
        icon={UserPlus}
      />
      <StatBox 
        label="Stars" 
        value={user.total_stars !== undefined ? user.total_stars : '-'} 
        icon={Star}
      />
      <StatBox 
        label="Contribs" 
        value={user.recent_activity_count !== undefined ? user.recent_activity_count : '-'} 
        icon={Calendar}
      />
    </div>
  );
};