import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  FolderGit2, 
  GraduationCap, 
  BellRing, 
  BarChart4 
} from 'lucide-react';
import { SwadhaarRole } from '../../utils/swadhaar.constants';

export interface SwadhaarMenuItem {
  title: string;
  icon: any;
  href: string;
  roles: string[];
}

export const SwadhaarMenuItems: SwadhaarMenuItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/swadhaar/dashboard',
    roles: [SwadhaarRole.ADMIN, SwadhaarRole.CFL_INCHARGE, SwadhaarRole.TRAINER],
  },
  {
    title: 'User Management',
    icon: Users,
    href: '/swadhaar/user-management',
    roles: [SwadhaarRole.ADMIN, SwadhaarRole.CFL_INCHARGE],
  },
  {
    title: 'Role Management',
    icon: ShieldAlert,
    href: '/swadhaar/role-management',
    roles: [SwadhaarRole.ADMIN],
  },
  {
    title: 'Content Library',
    icon: FolderGit2,
    href: '/swadhaar/content-library',
    roles: [SwadhaarRole.ADMIN, SwadhaarRole.CFL_INCHARGE, SwadhaarRole.TRAINER],
  },
  {
    title: 'Course Management',
    icon: GraduationCap,
    href: '/swadhaar/course-management',
    roles: [SwadhaarRole.ADMIN, SwadhaarRole.CFL_INCHARGE, SwadhaarRole.TRAINER],
  },
  {
    title: 'Notification Management',
    icon: BellRing,
    href: '/swadhaar/notification-management',
    roles: [SwadhaarRole.ADMIN, SwadhaarRole.CFL_INCHARGE],
  },
  {
    title: 'Metabase Analytics',
    icon: BarChart4,
    href: '/swadhaar/analytics',
    roles: [SwadhaarRole.ADMIN, SwadhaarRole.CFL_INCHARGE],
  },
];
