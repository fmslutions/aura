import React, { useState } from 'react';
import { AppView, Tenant } from '../types';
import { DashboardLayout } from '../components/DashboardLayout';
import { Home } from './Home';
import { Bookings } from './Bookings';
import { ClientsPage } from './Clients';
import { StaffPage } from './Staff';
import { ServicesPage } from './Services';
import { Courses } from './Courses';
import { GiftCards } from './GiftCards';
import { Growth } from './Growth';
import { Payments } from './Payments';
import { Settings } from './Settings';
import { ProfilePage } from './Profile';
import { User } from '@supabase/supabase-js';

interface DashboardProps {
    setView: (view: AppView) => void;
    activeTenant: Tenant;
    auraLogo: string | null;
    handleGenerateLogo: () => void;
    isGeneratingLogo: boolean;
    showInstall?: boolean;
    onInstall?: () => void;
    isSuperAdmin?: boolean;
    onSwitchToAdmin?: () => void;
    user?: User | null;
    onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
    setView,
    activeTenant,
    auraLogo,
    handleGenerateLogo,
    isGeneratingLogo,
    showInstall,
    onInstall,
    isSuperAdmin,
    onSwitchToAdmin,
    user,
    onLogout
}) => {
    const [activeTab, setActiveTab] = useState('home');

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <Home activeTenant={activeTenant} />;
            case 'bookings':
                return <Bookings />;
            case 'clients':
                return <ClientsPage />;
            case 'staff':
                return <StaffPage />;
            case 'services':
                return <ServicesPage />;
            case 'courses':
                return <Courses />;
            case 'gift-cards':
                return <GiftCards />;
            case 'growth':
                return <Growth />;
            case 'payments':
                return <Payments />;
            case 'settings':
                return <Settings />;
            case 'profile':
                return <ProfilePage />;
            default:
                return <Home activeTenant={activeTenant} />;
        }
    };

    return (
        <DashboardLayout
            setView={setView}
            activeTenant={activeTenant}
            logoUrl={auraLogo}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showInstall={showInstall}
            onInstall={onInstall}
            isSuperAdmin={isSuperAdmin}
            onSwitchToAdmin={onSwitchToAdmin}
            user={user}
            onLogout={onLogout}
        >
            {renderContent()}
        </DashboardLayout>
    );
};
