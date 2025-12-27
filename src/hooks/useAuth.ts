
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Tenant, UserRole } from '../../types';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserContext(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserContext(session.user.id);
            } else {
                setTenant(null);
                setRole(null);
                setIsSuperAdmin(false);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchUserContext(userId: string) {
        try {
            // 1. Get Profile (Role & Tenant)
            const { data: profile } = await supabase
                .from('profiles')
                .select('tenant_id, role')
                .eq('id', userId)
                .single();

            if (profile) {
                const userRole = profile.role as UserRole;
                setRole(userRole);
                const superAdmin = userRole === UserRole.SUPER_ADMIN;
                setIsSuperAdmin(superAdmin);

                // If super admin, check if there is an overridden tenant in localStorage
                // Otherwise use the profile tenant
                const overriddenTenantId = superAdmin ? localStorage.getItem('aura_super_admin_tenant_id') : null;
                const targetTenantId = overriddenTenantId || profile.tenant_id;

                if (targetTenantId) {
                    await fetchTenant(targetTenantId);
                } else if (!superAdmin) {
                    // Normal user with no tenant (rare)
                    setTenant(null);
                }
            }
        } catch (error) {
            console.error('Error fetching user context:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchTenant(tenantId: string) {
        try {
            const { data: tenantData } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', tenantId)
                .single();

            if (tenantData) {
                // Adapt DB model to App Frontend Model
                const appTenant: Tenant = {
                    id: tenantData.id,
                    name: tenantData.name,
                    slug: tenantData.slug,
                    primaryColor: '#6366f1',
                    secondaryColor: '#a855f7',
                    description: 'Aura Salon managed by AI.',
                    address: 'Unknown Address',
                    languages: ['en'],
                    timezone: 'UTC',
                    currency: 'EUR',
                    stripeConnected: false,
                    status: 'ACTIVE'
                };
                setTenant(appTenant);
            }
        } catch (error) {
            console.error('Error fetching tenant details:', error);
        }
    }

    // Function for Super Admin to switch context
    const switchTenant = async (tenantId: string | null) => {
        if (!isSuperAdmin) return;

        if (tenantId) {
            localStorage.setItem('aura_super_admin_tenant_id', tenantId);
            setLoading(true);
            await fetchTenant(tenantId);
            setLoading(false);
        } else {
            localStorage.removeItem('aura_super_admin_tenant_id');
            setTenant(null); // Or revert to own tenant if needed
            // For now, clearing tenant implies going back to "Global View" or needing to re-fetch own tenant
            if (user) fetchUserContext(user.id);
        }
    };

    return { user, tenant, role, isSuperAdmin, loading, switchTenant };
}
