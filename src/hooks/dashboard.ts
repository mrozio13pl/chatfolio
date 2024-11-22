import { create } from 'zustand';
import type { Dashboard } from '~/types';

interface DashboardStore {
    dashboard?: Dashboard;
    setDashboard: (dashboard: Dashboard) => void;
}

export const useDashboard = create<DashboardStore>((set) => ({
    setDashboard: (dashboard) => set({ dashboard }),
}));
