import React, { useState } from 'react';
import { AuraAdminLayout } from '../../components/AuraAdminLayout';
import { Overview } from './Overview';
import { Salons } from './Salons';
import { Users } from './Users';
import { Settings } from './Settings';
import { Reports } from './Reports';

interface AuraAdminProps {
    onSwitchTenant: (tenantId: string | null) => void;
    activeTenantId?: string;
    onLogout: () => void;
}

export const AuraAdmin: React.FC<AuraAdminProps> = ({ onSwitchTenant, activeTenantId, onLogout }) => {
    const [activePage, setActivePage] = useState('overview');

    const renderContent = () => {
        switch (activePage) {
            case 'overview':
                return <Overview />;
            case 'salons':
                return <Salons onSwitchTenant={onSwitchTenant} activeTenantId={activeTenantId} />;
            case 'users':
                return <Users />;
            case 'reports':
                return <Reports />;
            case 'settings':
                return <Settings />;
            default:
                return <Overview />;
        }
    };

    return (
        <AuraAdminLayout
            activePage={activePage}
            onNavigate={setActivePage}
            onLogout={onLogout}
        >
            {renderContent()}
        </AuraAdminLayout>
    );
};
