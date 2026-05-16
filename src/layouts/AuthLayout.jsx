import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-[#F0C84A]/30">
      <div className="w-full max-w-md p-6">
        <Outlet />
      </div>
      <footer className="absolute bottom-4 text-center w-full text-sm text-muted-foreground">
        © {new Date().getFullYear()} Bindu Jewellery. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
