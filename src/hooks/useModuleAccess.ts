import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Tenant {
    id: string;
    name: string;
    plan: string;
    modules: string[];
}

interface Plan {
    name: string;
    displayName: string;
    modules: string[];
    limits: {
        staff: number;
        services: number;
        bookings_month: number;
    };
}

export const useModuleAccess = () => {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTenantData();
    }, []);

    const fetchTenantData = async () => {
        try {
            setLoading(true);

            // Get current user's profile to find tenant_id
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', user.id)
                .single();

            if (!profile?.tenant_id) {
                setLoading(false);
                return;
            }

            // Fetch tenant data with plan and modules
            const { data: tenantData, error } = await supabase
                .from('tenants')
                .select('id, name, plan, modules')
                .eq('id', profile.tenant_id)
                .single();

            if (error) throw error;

            setTenant({
                id: tenantData.id,
                name: tenantData.name,
                plan: tenantData.plan || 'FREE',
                modules: Array.isArray(tenantData.modules) ? tenantData.modules : []
            });
        } catch (error) {
            console.error('Error fetching tenant data:', error);
        } finally {
            setLoading(false);
        }
    };

    const hasModule = (moduleName: string): boolean => {
        if (!tenant) return false;
        return tenant.modules.includes(moduleName);
    };

    const hasFeature = (featureName: string): boolean => {
        // Map features to plans
        const featureMap: Record<string, string[]> = {
            'marketing': ['BASIC', 'PRO', 'ENTERPRISE'],
            'gift_cards': ['PRO', 'ENTERPRISE'],
            'courses': ['ENTERPRISE'],
            'analytics': ['ENTERPRISE']
        };

        if (!tenant) return false;
        return featureMap[featureName]?.includes(tenant.plan) || false;
    };

    const canCreate = (resourceType: 'staff' | 'services', currentCount: number): boolean => {
        if (!tenant) return false;

        // Enterprise has unlimited resources
        if (tenant.plan === 'ENTERPRISE') return true;

        // Define limits per plan
        const limits: Record<string, { staff: number; services: number }> = {
            'FREE': { staff: 2, services: 5 },
            'BASIC': { staff: 5, services: 20 },
            'PRO': { staff: 15, services: 50 }
        };

        const planLimits = limits[tenant.plan];
        if (!planLimits) return false;

        return currentCount < planLimits[resourceType];
    };

    return {
        tenant,
        loading,
        hasModule,
        hasFeature,
        canCreate,
        plan: tenant?.plan || 'FREE'
    };
};
