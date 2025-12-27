import React, { useState } from 'react';
import { AppView, Tenant } from '../types';
import { DashboardLayout } from '../components/DashboardLayout';
import { Home } from './Home';
import { Bookings } from './Bookings';
import { ClientsPage } from './Clients';
import { StaffPage } from './Staff';
import { ServicesPage } from './Services';
import { Growth } from './Growth';
import { Payments } from './Payments';
import { Settings } from './Settings';

interface DashboardProps {
    setView: (view: AppView) => void;
    activeTenant: Tenant;
    auraLogo: string | null;
    handleGenerateLogo: () => void;
    isGeneratingLogo: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
    setView,
    activeTenant,
    auraLogo,
    handleGenerateLogo,
    isGeneratingLogo
}) => {
    const [activeTab, setActiveTab] = useState('home');

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <Home
                    activeTenant={activeTenant}
                    auraLogo={auraLogo}
                    handleGenerateLogo={handleGenerateLogo}
                    isGeneratingLogo={isGeneratingLogo}
                />;
            case 'bookings':
                return <Bookings />;
            case 'clients':
                return <ClientsPage />;
            case 'staff':
                return <StaffPage />;
            case 'services':
                return <ServicesPage />;
            case 'growth':
                return <Growth />;
            case 'payments':
                return <Payments />;
            case 'settings':
                return <Settings />;
            default:
                return <Home
                    activeTenant={activeTenant}
                    auraLogo={auraLogo}
                    handleGenerateLogo={handleGenerateLogo}
                    isGeneratingLogo={isGeneratingLogo}
                />;
        }
    };

    return (
        <DashboardLayout
            setView={setView}
            activeTenant={activeTenant}
            logoUrl={auraLogo}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </DashboardLayout>
    );
};
