// app/(tabs)/index.tsx
import React from 'react';
import { useAuth } from '../../src/store/AuthContext';
import DashboardAdmin from '../../src/components/dashboards/DashboardAdmin';
import DashboardRecepcionista from '../../src/components/dashboards/DashboardRecepcionista';
import DashboardEntrenador from '../../src/components/dashboards/DashboardEntrenador';
import DashboardCliente from '../../src/components/dashboards/DashboardCliente';

export default function DashboardScreen() {
  const { user } = useAuth();

  switch (user?.rol) {
    case 'admin': return <DashboardAdmin />;
    case 'recepcionista': return <DashboardRecepcionista />;
    case 'entrenador': return <DashboardEntrenador />;
    case 'cliente': return <DashboardCliente />;
    default: return null;
  }
}
