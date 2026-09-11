import React from 'react';
import UnauthorizedPage from './UnauthorizedPage';

export type UserRole = 'admin' | 'pengawas' | 'sekolah';

interface RoleGuardProps {
  userRole: UserRole;
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function RoleGuard({ userRole, allowedRoles, children }: RoleGuardProps) {
  if (!allowedRoles.includes(userRole)) {
    return <UnauthorizedPage userRole={userRole} requiredRoles={allowedRoles} />;
  }

  return <>{children}</>;
}
