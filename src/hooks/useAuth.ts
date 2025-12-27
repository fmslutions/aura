
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Tenant } from '../../types';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchTenant(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchTenant(session.user.id);
            } else {
                setTenant(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchTenant(userId: string) {
        try {
            // 1. Get Profile to find Tenant ID
            const { data: profile } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', userId)
                .single();

            if (profile?.tenant_id) {
                // 2. Get Tenant Details
                const { data: tenantData } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', profile.tenant_id)
                    .single();

                if (tenantData) {
                    // Adapt DB model to App Frontend Model
                    const appTenant: Tenant = {
                        id: tenantData.id,
                        name: tenantData.name,
                        slug: tenantData.slug,
                        // Default styling for now
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
            }
        } catch (error) {
            console.error('Error fetching tenant:', error);
        } finally {
            setLoading(false);
        }
    }

    return { user, tenant, loading };
}
