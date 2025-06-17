import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used for navigation
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  Users,
  UserCircle,
  FileText,
  FileSpreadsheet,
  ShoppingCart,
  Mail,
  Archive,
  CalendarDays,
  HelpCircle,
  Settings,
  Aperture,
  type LucideIcon
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isBottom?: boolean;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutGrid },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Customers', href: '/customers', icon: UserCircle },
  { label: 'Proposals', href: '/proposals', icon: FileText },
  { label: 'Invoices', href: '/invoices', icon: FileSpreadsheet },
  { label: 'Items', href: '/items', icon: ShoppingCart },
  { label: 'Mail', href: '/mail', icon: Mail },
  { label: 'Shoebox', href: '/shoebox', icon: Archive },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
];

const bottomNavItems: NavItem[] = [
  { label: 'Help', href: '/help', icon: HelpCircle, isBottom: true },
  { label: 'Settings', href: '/settings', icon: Settings, isBottom: true },
];

interface SidebarProps {
  isOpen: boolean;
  activePath: string;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activePath, className }) => {
  const renderNavItem = (item: NavItem) => {
    const isActive = activePath === item.href;
    const linkClasses = cn(
      'flex items-center space-x-3 rounded-md text-sm font-medium',
      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      'transition-colors duration-150',
      isOpen ? 'px-3 py-2' : 'p-3 justify-center',
      isActive && 'bg-sidebar-primary text-sidebar-primary-foreground'
    );

    if (!isOpen) {
      return (
        <TooltipProvider key={item.href} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={item.href} className={linkClasses}>
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="sr-only">{item.label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link key={item.href} to={item.href} className={linkClasses}>
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border',
        'transition-all duration-300 ease-in-out',
        isOpen ? 'w-64' : 'w-20',
        className
      )}
    >
      <div className={cn('flex items-center border-b border-sidebar-border', isOpen ? 'h-16 px-4 space-x-2' : 'h-16 justify-center')}>
        <Aperture className="h-8 w-8 text-sidebar-primary flex-shrink-0" />
        {isOpen && <span className="text-xl font-semibold">Dashboard</span>}
      </div>

      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {mainNavItems.map(renderNavItem)}
      </nav>

      <div className="mt-auto p-2 border-t border-sidebar-border">
        <div className="space-y-1">
            {bottomNavItems.map(renderNavItem)}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
