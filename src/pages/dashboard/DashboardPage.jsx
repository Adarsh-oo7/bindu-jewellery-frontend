import React from 'react';
import useAuth from '../../hooks/useAuth';
import AdminDashboard from '../admin/AdminDashboard';
import ManagerDashboard from '../manager/ManagerDashboard';
import StaffDashboard from '../staff/StaffDashboard';

/**
 * DashboardPage acts as a dispatcher. 
 * It renders the correct dashboard component based on the user's role.
 * This is kept for backwards compatibility with the '/' route.
 */
const DashboardPage = () => {
  const { isOwner, isManager } = useAuth();

  if (isOwner) {
    return <AdminDashboard />;
  }
  
  if (isManager) {
    return <ManagerDashboard />;
  }

  // Fallback for staff, telecaller, field, etc.
  return <StaffDashboard />;
};

export default DashboardPage;
