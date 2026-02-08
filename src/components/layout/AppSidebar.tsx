import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformConfig } from '@/contexts/PlatformConfigContext';
import type { LucideIcon } from 'lucide-react';
import {
  Users,
  Building2,
  Flame,
  Package,
  UtensilsCrossed,
  Landmark,
  Megaphone,
  UserCheck,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  LayoutGrid,
  UserRound,
  Calendar,
  Wallet,
  CalendarOff,
  Clock,
  Home,
  Wrench,
  CalendarDays,
  Star,
  Mail,
  HandHeart,
  UserCog,
  ClipboardList,
  FileInput,
  ShoppingCart,
  ChefHat,
  Cookie,
  Carrot,
  Play,
  Truck,
  FileBox,
  Radio,
  ScrollText,
  Bell,
  CalendarRange,
  FolderOpen,
  ListTodo,
  Receipt,
  FileBarChart,
  FileText,
  Contact,
  Heart,
  MessageSquare,
  Search,
  X,
  HelpCircle,
  Sparkles,
  MapPin,
  DoorOpen,
  Monitor,
  Network,
  Warehouse,
  Gift,
  ClipboardCheck,
  BarChart3,
  Eye,
  Trash2,
  CheckSquare,
  UsersRound,
  Briefcase,
  Crown,
  GitBranch,
  School,
  BookOpen,
  Activity,
  FileCheck,
  TrendingUp,
  FolderSearch,
  Share2,
  Repeat,
  Timer,
  AlertTriangle,
  Columns,
  GitBranch as WorkflowIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

interface SubModule {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: string[]; // Optional: restrict to specific roles. Empty array means all roles
  badge?: string | number; // Optional: badge count for notifications
}

interface ModuleConfig {
  id: string;
  name: string;
  icon: LucideIcon;
  basePath: string;
  subModules: SubModule[];
}

const moduleConfigs: ModuleConfig[] = [
  {
    id: 'projects',
    name: 'Projects & Initiatives',
    icon: FolderSearch,
    basePath: '/projects',
    subModules: [
      { name: 'Dashboard', href: '/projects', icon: LayoutGrid },
      { name: 'Project Registry', href: '/projects/registry', icon: ClipboardList },
      { name: 'My Activities', href: '/projects/my-tasks', icon: ListTodo },
      { name: 'Project Reports', href: '/projects/reports', icon: BarChart3 },
    ],
  },
  {
    id: 'structure',
    name: 'Temple Structure',
    icon: Building2,
    basePath: '/structure',
    subModules: [
      { name: 'Temples', href: '/structure/temples', icon: Building2 },
      { name: 'Child Temples', href: '/structure/child-temples', icon: Home },
      { name: 'Sacred', href: '/structure/sacred', icon: Sparkles },
      { name: 'Zones', href: '/structure/zones', icon: MapPin },
      { name: 'Halls & Rooms', href: '/structure/halls-rooms', icon: DoorOpen },
      { name: 'Counters', href: '/structure/counters', icon: Monitor },
      { name: 'Hierarchy View', href: '/structure/hierarchy', icon: Network },
    ],
  },
  {
    id: 'pr',
    name: 'PR & Communication',
    icon: Megaphone,
    basePath: '/pr',
    subModules: [
      { name: 'Dashboard', href: '/pr/dashboard', icon: LayoutGrid },
      { name: 'Announcements', href: '/pr/announcements', icon: Bell },
      { name: 'Communication Center', href: '/pr/communication', icon: MessageSquare },
      { name: 'Social & Digital', href: '/pr/social', icon: Share2 },
      { name: 'Live Streaming', href: '/pr/live-streaming', icon: Radio },
      { name: 'Live Darshan', href: '/pr/live-darshan', icon: Radio },
      { name: 'Devotee Experience', href: '/pr/devotee-experience', icon: Users },
    ],
  },
  {
    id: 'rituals',
    name: 'Rituals & Darshan',
    icon: Flame,
    basePath: '/rituals',
    subModules: [
      { name: 'Offerings (Sevas & Darshan)', href: '/rituals/offerings', icon: Flame },
      { name: 'Daily Schedule', href: '/rituals/schedule', icon: CalendarDays },
      { name: 'Festival / Special Days', href: '/rituals/festivals', icon: Star },
      { name: 'Priest Assignment', href: '/rituals/priests', icon: UserCog },
    ],
  },
  {
    id: 'hr',
    name: 'People / HR',
    icon: Users,
    basePath: '/hr',
    subModules: [
      { name: 'Employees', href: '/hr/employees', icon: UserRound },
      { name: 'Organization', href: '/hr/organization', icon: Building2 },
      { name: 'Shifts', href: '/hr/shifts', icon: Calendar },
      { name: 'Leave & Holidays', href: '/hr/leave', icon: CalendarOff },
      { name: 'Attendance', href: '/hr/attendance', icon: Clock },
      { name: 'Expenses', href: '/hr/expenses', icon: Wallet },
    ],
  },
  {
    id: 'tasks',
    name: 'Task Management',
    icon: CheckSquare,
    basePath: '/tasks',
    subModules: [
      { name: 'Dashboard', href: '/tasks/dashboard', icon: LayoutGrid },
      { name: 'Tasks', href: '/tasks/tasks', icon: ListTodo },
    ],
  },
  {
    id: 'branch',
    name: 'Branch Management',
    icon: GitBranch,
    basePath: '/branch',
    subModules: [
      { name: 'Branch Directory', href: '/branch/directory', icon: GitBranch },
      { name: 'Hierarchy & Regions', href: '/branch/hierarchy', icon: Network },
      { name: 'Branch Users', href: '/branch/users', icon: Users },
      { name: 'Access & Data Control', href: '/branch/access', icon: Eye },
      { name: 'Branch Overview', href: '/branch/overview', icon: LayoutGrid },
    ],
  },
  {
    id: 'institution',
    name: 'Institution',
    icon: School,
    basePath: '/institution',
    subModules: [
      { name: 'Institutions', href: '/institution/institutions', icon: School },
      { name: 'Programs', href: '/institution/programs', icon: BookOpen },
      { name: 'Students', href: '/institution/students', icon: Users },
      { name: 'Faculty', href: '/institution/faculty', icon: UserRound },
      { name: 'Reports', href: '/institution/reports', icon: BarChart3 },
    ],
  },
  {
    id: 'knowledge',
    name: 'Knowledge Management',
    icon: BookOpen,
    basePath: '/knowledge',
    subModules: [
      { name: 'Dashboard', href: '/knowledge/dashboard', icon: LayoutGrid },
      { name: 'Categories Management', href: '/knowledge/categories', icon: FolderOpen },
      { name: 'Knowledge Management', href: '/knowledge/documents', icon: FileText },
      { name: 'Approval Management', href: '/knowledge/approvals', icon: ClipboardCheck },
      { name: 'Beta Conversation Testing', href: '/knowledge/beta-testing', icon: MessageSquare },
    ],
  },
  {
    id: 'inventory',
    name: 'Stock Management',
    icon: Package,
    basePath: '/inventory',
    subModules: [
      { name: 'Dashboard', href: '/inventory/dashboard', icon: LayoutGrid },
      { name: 'Items Master', href: '/inventory/items', icon: ClipboardList },
      { name: 'Godowns & Stores', href: '/inventory/godowns', icon: Warehouse },
      { name: 'Stock Transactions', href: '/inventory/transactions', icon: FileInput },
      { name: 'Purchase Management', href: '/inventory/purchases', icon: ShoppingCart },
      { name: 'Material Donations', href: '/inventory/donations', icon: Gift },
      { name: 'Stock Audits', href: '/inventory/audits', icon: ClipboardCheck },
      { name: 'Reports', href: '/inventory/reports', icon: BarChart3 },
    ],
  },
  {
    id: 'crowd',
    name: 'Crowd & Capacity Management',
    icon: UsersRound,
    basePath: '/crowd',
    subModules: [
      { name: 'Capacity Dashboard', href: '/crowd/dashboard', icon: LayoutGrid },
      { name: 'Zone Capacity', href: '/crowd/zones', icon: MapPin },
      { name: 'Real-time Monitoring', href: '/crowd/monitoring', icon: Monitor },
      { name: 'Crowd Analytics', href: '/crowd/analytics', icon: BarChart3 },
    ],
  },
  {
    id: 'devotee',
    name: 'Devotee/Volunteer Management',
    icon: UserCheck,
    basePath: '/devotee',
    subModules: [
      { name: 'Devotees', href: '/devotee/devotees', icon: Contact },
      { name: 'Volunteers', href: '/devotee/volunteers', icon: Users },
      { name: 'Volunteer Activities', href: '/devotee/activities', icon: Calendar },
      { name: 'Reports', href: '/devotee/reports', icon: BarChart3 },
    ],
  },
  {
    id: 'freelancer',
    name: 'Freelancer',
    icon: Briefcase,
    basePath: '/freelancer',
    subModules: [
      { name: 'Freelancer Directory', href: '/freelancer/directory', icon: Users },
      { name: 'Assignments', href: '/freelancer/assignments', icon: Briefcase },
      { name: 'Payments', href: '/freelancer/payments', icon: Wallet },
      { name: 'Performance', href: '/freelancer/performance', icon: BarChart3 },
    ],
  },
  {
    id: 'vip',
    name: 'VIP Devotee Management',
    icon: Crown,
    basePath: '/vip',
    subModules: [
      { name: 'VIP Directory', href: '/vip/directory', icon: Crown },
      { name: 'VIP Services', href: '/vip/services', icon: Star },
      { name: 'VIP Bookings', href: '/vip/bookings', icon: Calendar },
      { name: 'VIP Communications', href: '/vip/communications', icon: MessageSquare },
    ],
  },
  {
    id: 'events',
    name: 'Event Management',
    icon: Calendar,
    basePath: '/events',
    subModules: [
      { name: 'Events Calendar', href: '/events/calendar', icon: Calendar },
      { name: 'Event Planning', href: '/events/planning', icon: CalendarDays },
      { name: 'Event Execution', href: '/events/execution', icon: Play },
      { name: 'Event Reports', href: '/events/reports', icon: BarChart3 },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen & Prasad',
    icon: UtensilsCrossed,
    basePath: '/kitchen',
    subModules: [
      { name: 'Recipes', href: '/kitchen/recipes', icon: ChefHat },
      { name: 'Production Planning', href: '/kitchen/production-planning', icon: Calendar },
      { name: 'Production Execution', href: '/kitchen/production-execution', icon: Play },
      { name: 'Kitchen Stores', href: '/kitchen/stores', icon: Package },
    ],
  },
  {
    id: 'prasad',
    name: 'Prasad Management',
    icon: Cookie,
    basePath: '/prasad',
    subModules: [
      { name: 'Prasad Master', href: '/prasad/master', icon: ClipboardList },
      { name: 'Prasad Inventory', href: '/prasad/inventory', icon: Package },
      { name: 'Distribution', href: '/prasad/distribution', icon: Truck },
    ],
  },
  {
    id: 'assets',
    name: 'Asset Management',
    icon: Landmark,
    basePath: '/assets',
    subModules: [
      { name: 'Dashboard', href: '/assets/dashboard', icon: LayoutGrid },
      { name: 'Asset Master', href: '/assets/master', icon: FileBox },
      { name: 'Movement & Transfer', href: '/assets/movement', icon: Truck },
      { name: 'Maintenance & AMC', href: '/assets/maintenance', icon: ScrollText },
      { name: 'Audit & Verification', href: '/assets/audit', icon: ClipboardCheck },
      { name: 'Disposal', href: '/assets/disposal', icon: Trash2 },
      { name: 'Reports', href: '/assets/reports', icon: BarChart3 },
    ],
  },

  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    basePath: '/settings',
    subModules: [
      { name: 'General Settings', href: '/settings/general', icon: Settings },
      { name: 'User Management', href: '/settings/users', icon: Users },
      { name: 'Permissions', href: '/settings/permissions', icon: UserCog },
      { name: 'System Configuration', href: '/settings/system', icon: Wrench },
    ],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { modules: platformModules } = usePlatformConfig();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    management: false,
    sla: false,
    analytics: false,
    admin: false,
  });

  // Filter modules based on platform config
  const visibleModules = moduleConfigs.filter(module => {
    const moduleConfig = platformModules[module.id];
    return moduleConfig?.enabled !== false; // Show if enabled or not specified
  });

  // Helper to check if a module is active based on path
  const isModuleActive = (module: ModuleConfig) => {
    return location.pathname === module.basePath || location.pathname.startsWith(module.basePath + '/');
  };

  // Find current module based on path - try visibleModules first, then fallback to all modules
  const currentModule = visibleModules.find(isModuleActive)
    || moduleConfigs.find(isModuleActive);
  const ModuleIcon = currentModule?.icon || LayoutGrid;

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSearch && searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
        setSearchQuery('');
      }
    };

    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar/95 backdrop-blur-sm border-r border-sidebar-border/50 transition-all duration-300 ease-out flex flex-col shadow-lg",
        collapsed ? "w-16" : "w-60"
      )}
      style={collapsed ? { width: '64px', maxWidth: '64px', minWidth: '64px', overflow: 'hidden' } : { width: '240px', maxWidth: '240px', minWidth: '240px', overflow: 'hidden' }}
    >
      {/* Header - Module Info (Clickable to go back to Hub) */}
      <button
        onClick={() => navigate('/hub')}
        className="flex items-center gap-3 h-16 px-4 border-b border-sidebar-border/50 shrink-0 bg-sidebar/80 backdrop-blur-sm hover:bg-sidebar-accent/50 transition-colors w-full cursor-pointer min-w-0 max-w-full overflow-hidden"
      >
        {!collapsed ? (
          <>
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 flex-shrink-0">
              <ModuleIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0 text-left overflow-hidden" style={{ maxWidth: 'calc(240px - 64px)' }}>
              <span className="text-base font-bold tracking-tight text-primary truncate block leading-tight" style={{ maxWidth: '100%' }}>
                {currentModule?.name || 'TempleERP'}
              </span>
              <span className="text-xs text-gray-600 leading-tight truncate block" style={{ maxWidth: '100%' }}>{user?.templeName}</span>
            </div>
          </>
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
            <ModuleIcon className="w-6 h-6 text-primary-foreground" />
          </div>
        )}
      </button>

      {/* Global Search Bar */}
      <div className="px-3 pt-3 pb-2 relative" ref={searchRef}>
        {!collapsed ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-sm border-0 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchQuery('');
                }
              }}
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-10 rounded-xl hover:bg-sidebar-accent transition-colors"
            title="Search"
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-5 w-5 text-gray-900" />
          </Button>
        )}

        {/* Search Results Popup */}
        {showSearch && searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-1 mx-3 bg-background border border-border rounded-xl shadow-lg z-50 max-h-96 overflow-hidden">
            <ScrollArea className="max-h-96">
              <div className="p-2 space-y-1">
                {/* Search results would be rendered here */}
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Search results for "{searchQuery}" will appear here
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Search */}
      {/* <div className={cn("px-3 pb-3", collapsed && "px-2")}>
        {!collapsed ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search modules..."
              className="pl-10 h-10 text-sm border-0 transition-all"
            />
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-full h-10 rounded-xl hover:bg-sidebar-accent transition-colors"
            title="Search"
          >
            <Search className="h-5 w-5 text-gray-900" />
          </Button>
        )}
      </div> */}

      {/* Module Sub-Navigation */}
      <ScrollArea className="flex-1 py-2 min-h-0 max-w-full overflow-hidden">
        <nav className="px-3 space-y-1 overflow-hidden max-w-full">
          {!currentModule?.subModules || currentModule.subModules.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground text-center">
              {!collapsed && "No sub-modules available"}
            </div>
          ) : (() => {
            // Filter submodules based on role
            const filteredSubModules = currentModule.subModules.filter((sub) => {
              if (sub.roles && sub.roles.length > 0) {
                if (!user || !user.role) return false;
                return sub.roles.includes(user.role);
              }
              return true;
            });

            if (filteredSubModules.length === 0) {
              return (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                  {!collapsed && "No accessible sub-modules"}
                </div>
              );
            }

            return filteredSubModules.map((sub) => {
              const SubIcon = sub.icon;
              const isActive = location.pathname === sub.href || location.pathname.startsWith(sub.href + '/');

              return (
                <NavLink
                  key={sub.href}
                  to={sub.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-w-0 max-w-full overflow-hidden",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-gray-700 hover:bg-sidebar-accent/80 hover:text-primary font-normal",
                    collapsed && "justify-center px-2",
                    "active:scale-[0.98]"
                  )}
                  title={sub.name}
                >
                  <SubIcon className={cn("h-4 w-4 shrink-0 transition-colors flex-shrink-0", isActive ? "text-primary" : "text-gray-900")} />
                  {!collapsed && (
                    <>
                      <span
                        className="truncate min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                        style={{ maxWidth: 'calc(240px - 80px)' }}
                      >
                        {sub.name}
                      </span>
                      {sub.badge && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                          {sub.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            });
          })()}
        </nav>
      </ScrollArea>

      {/* Quick Actions - Notifications & Help */}
      <div className={cn("px-3 py-2 space-y-1 max-w-full overflow-hidden", collapsed && "space-y-1")}>
        <button
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium min-w-0 max-w-full overflow-hidden",
            "text-gray-700 font-normal hover:text-primary hover:bg-sidebar-accent/80 transition-all duration-200",
            "active:scale-[0.98]",
            collapsed && "justify-center px-2"
          )}
        >
          <div className="relative flex-shrink-0">
            <Bell className="h-4 w-4 shrink-0 text-gray-900" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-sidebar" />
          </div>
          {!collapsed && (
            <span
              className="truncate min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ maxWidth: 'calc(240px - 80px)' }}
            >
              Notifications
            </span>
          )}
        </button>
        <button
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium min-w-0 max-w-full overflow-hidden",
            "text-gray-700 font-normal hover:text-primary hover:bg-sidebar-accent/80 transition-all duration-200",
            "active:scale-[0.98]",
            collapsed && "justify-center px-2"
          )}
        >
          <HelpCircle className="h-4 w-4 shrink-0 text-gray-900 flex-shrink-0" />
          {!collapsed && (
            <span
              className="truncate min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ maxWidth: 'calc(240px - 80px)' }}
            >
              Help & Support
            </span>
          )}
        </button>
      </div>

      {/* Footer - User */}
      <div className="shrink-0 border-t border-sidebar-border/50 p-3 bg-sidebar/80 backdrop-blur-sm max-w-full overflow-hidden">
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-xl min-w-0 max-w-full overflow-hidden">
            <Avatar className="h-9 w-9 ring-2 ring-border/50 flex-shrink-0">
              <AvatarFallback className="bg-muted text-gray-900 text-sm font-semibold">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 overflow-hidden" style={{ maxWidth: 'calc(240px - 100px)' }}>
              <p className="text-sm font-semibold text-gray-900 truncate" style={{ maxWidth: '100%' }}>
                {user?.name}
              </p>
              <p className="text-xs text-gray-600 truncate capitalize" style={{ maxWidth: '100%' }}>
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-sidebar-accent/80 transition-colors flex-shrink-0"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 text-gray-900" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-9 w-9 ring-2 ring-border/50">
              <AvatarFallback className="bg-muted text-gray-900 text-sm font-semibold">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-sidebar-accent/80 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 text-gray-900" />
            </Button>
          </div>
        )}
      </div>

      {/* Toggle Button on Divider */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-50",
          "w-7 h-7 rounded-full bg-background border-2 border-border shadow-lg",
          "flex items-center justify-center",
          "hover:bg-accent hover:border-primary/40 hover:scale-110 hover:shadow-xl",
          "active:scale-95",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
        )}
        style={{ right: '-14px' }}
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 text-primary transition-all duration-300 ease-in-out",
            collapsed && "rotate-180"
          )}
        />
      </button>
    </aside>
  );
}
