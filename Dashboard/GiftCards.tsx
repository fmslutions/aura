import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { useModuleAccess } from '../src/hooks/useModuleAccess';

interface GiftCard {
    id: string;
    code: string;
    initial_value: number;
    current_value: number;
    purchased_by: string | null;
    purchased_at: string;
    expires_at: string | null;
    status: string;
    created_at: string;
}

interface Transaction {
    id: string;
    amount: number;
    type: string;
    created_at: string;
    notes: string | null;
}

export const GiftCards: React.FC = () => {
    const { hasModule, loading: moduleLoading } = useModuleAccess();
    const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [showTransactionsModal, setShowTransactionsModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
    const [createForm, setCreateForm] = useState({
        value: 50,
        quantity: 1,
        expiresInMonths: 12,
        purchasedBy: ''
    });
    const [redeemForm, setRedeemForm] = useState({
        code: '',
        amount: 0
    });

    useEffect(() => {
        if (!moduleLoading) {
            fetchGiftCards();
        }
    }, [moduleLoading]);

    const fetchGiftCards = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('gift_cards')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGiftCards(data || []);
        } catch (error) {
            console.error('Error fetching gift cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async (cardId: string) => {
        try {
            const { data, error } = await supabase
                .from('gift_card_transactions')
                .select('*')
                .eq('gift_card_id', cardId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const generateCode = (): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'GC-';
        for (let i = 0; i < 12; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
            if (i === 3 || i === 7) code += '-';
        }
        return code;
    };

    const handleCreateGiftCards = async () => {
        try {
            if (createForm.value <= 0) {
                alert('O valor deve ser maior que zero.');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', (await supabase.auth.getUser()).data.user?.id)
                .single();

            if (!profile?.tenant_id) {
                alert('Erro ao identificar o salão.');
                return;
            }

            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + createForm.expiresInMonths);

            const cardsToCreate = [];
            for (let i = 0; i < createForm.quantity; i++) {
                cardsToCreate.push({
                    tenant_id: profile.tenant_id,
                    code: generateCode(),
                    initial_value: createForm.value,
                    current_value: createForm.value,
                    purchased_by: createForm.purchasedBy || null,
                    expires_at: expiresAt.toISOString(),
                    status: 'ACTIVE'
                });
            }

            const { error } = await supabase
                .from('gift_cards')
                .insert(cardsToCreate);

            if (error) throw error;

            // Create purchase transactions
            const { data: newCards } = await supabase
                .from('gift_cards')
                .select('id, code')
                .in('code', cardsToCreate.map(c => c.code));

            if (newCards) {
                const transactionsToCreate = newCards.map(card => ({
                    gift_card_id: card.id,
                    amount: createForm.value,
                    type: 'PURCHASE',
                    notes: `Gift card criado${createForm.purchasedBy ? ` para ${createForm.purchasedBy}` : ''}`
                }));

                await supabase
                    .from('gift_card_transactions')
                    .insert(transactionsToCreate);
            }

            alert(`${createForm.quantity} gift card(s) criado(s) com sucesso!`);
            setShowCreateModal(false);
            resetCreateForm();
            fetchGiftCards();
        } catch (error) {
            console.error('Error creating gift cards:', error);
            alert('Erro ao criar gift cards');
        }
    };

    const handleRedeemGiftCard = async () => {
        try {
            if (!redeemForm.code || redeemForm.amount <= 0) {
                alert('Por favor, preencha o código e o valor.');
                return;
            }

            // Find gift card by code
            const { data: card, error: fetchError } = await supabase
                .from('gift_cards')
                .select('*')
                .eq('code', redeemForm.code.toUpperCase())
                .single();

            if (fetchError || !card) {
                alert('Gift card não encontrado.');
                return;
            }

            if (card.status !== 'ACTIVE') {
                alert(`Gift card está ${card.status}. Não pode ser utilizado.`);
                return;
            }

            if (card.current_value < redeemForm.amount) {
                alert(`Saldo insuficiente. Valor disponível: €${card.current_value}`);
                return;
            }

            const newValue = card.current_value - redeemForm.amount;
            const newStatus = newValue === 0 ? 'REDEEMED' : 'ACTIVE';

            // Update gift card value
            const { error: updateError } = await supabase
                .from('gift_cards')
                .update({
                    current_value: newValue,
                    status: newStatus
                })
                .eq('id', card.id);

            if (updateError) throw updateError;

            // Create redemption transaction
            await supabase
                .from('gift_card_transactions')
                .insert({
                    gift_card_id: card.id,
                    amount: -redeemForm.amount,
                    type: 'REDEMPTION',
                    notes: 'Resgatado no salão'
                });

            alert(`Gift card resgatado! Valor utilizado: €${redeemForm.amount}. Saldo restante: €${newValue}`);
            setShowRedeemModal(false);
            resetRedeemForm();
            fetchGiftCards();
        } catch (error) {
            console.error('Error redeeming gift card:', error);
            alert('Erro ao resgatar gift card');
        }
    };

    const handleCancelCard = async (cardId: string) => {
        if (!confirm('Tem certeza que deseja cancelar este gift card?')) return;

        try {
            const { error } = await supabase
                .from('gift_cards')
                .update({ status: 'CANCELLED' })
                .eq('id', cardId);

            if (error) throw error;

            alert('Gift card cancelado com sucesso!');
            fetchGiftCards();
        } catch (error) {
            console.error('Error cancelling gift card:', error);
            alert('Erro ao cancelar gift card');
        }
    };

    const openTransactionsModal = (card: GiftCard) => {
        setSelectedCard(card);
        fetchTransactions(card.id);
        setShowTransactionsModal(true);
    };

    const resetCreateForm = () => {
        setCreateForm({
            value: 50,
            quantity: 1,
            expiresInMonths: 12,
            purchasedBy: ''
        });
    };

    const resetRedeemForm = () => {
        setRedeemForm({
            code: '',
            amount: 0
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REDEEMED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'EXPIRED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'CANCELLED': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    // Module access check
    if (moduleLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500"></i>
            </div>
        );
    }

    if (!hasModule('gift_cards')) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center px-4">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 text-amber-600">
                    <i className="fas fa-lock text-3xl"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Módulo de Gift Cards Bloqueado</h3>
                <p className="text-slate-500 mb-6 max-w-md">
                    Este recurso está disponível para clientes dos planos <span className="font-bold text-indigo-600">PRO</span> e <span className="font-bold text-purple-600">ENTERPRISE</span>.
                </p>
                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg">
                    <i className="fas fa-arrow-up mr-2"></i> Fazer Upgrade
                </button>
            </div>
        );
    }

    const stats = {
        total: giftCards.length,
        active: giftCards.filter(c => c.status === 'ACTIVE').length,
        totalValue: giftCards.reduce((sum, c) => sum + c.current_value, 0),
        redeemed: giftCards.filter(c => c.status === 'REDEEMED').length
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Gift Cards</h1>
                    <p className="text-slate-500">Gerencie cartões presente e resgates</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowRedeemModal(true)}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                    >
                        <i className="fas fa-check-circle"></i> Resgatar
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                    >
                        <i className="fas fa-plus"></i> Criar Gift Card
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total de Cards</p>
                    <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ativos</p>
                    <p className="text-3xl font-black text-emerald-600">{stats.active}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Valor Total</p>
                    <p className="text-3xl font-black text-indigo-600">€{stats.totalValue.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resgatados</p>
                    <p className="text-3xl font-black text-purple-600">{stats.redeemed}</p>
                </div>
            </div>

            {/* Gift Cards List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <i className="fas fa-circle-notch animate-spin text-4xl text-indigo-500"></i>
                </div>
            ) : giftCards.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Código</th>
                                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Valor Inicial</th>
                                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Saldo</th>
                                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Comprado Por</th>
                                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Expira Em</th>
                                    <th className="text-left p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {giftCards.map((card) => (
                                    <tr key={card.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <span className="font-mono font-bold text-sm text-indigo-600">{card.code}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-slate-900">€{card.initial_value.toFixed(2)}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-emerald-600">€{card.current_value.toFixed(2)}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-slate-600">{card.purchased_by || '-'}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-slate-600">
                                                {card.expires_at ? new Date(card.expires_at).toLocaleDateString('pt-BR') : 'Sem expiração'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(card.status)}`}>
                                                {card.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openTransactionsModal(card)}
                                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-xs hover:bg-indigo-100 transition-all"
                                                >
                                                    <i className="fas fa-history mr-1"></i> Histórico
                                                </button>
                                                {card.status === 'ACTIVE' && (
                                                    <button
                                                        onClick={() => handleCancelCard(card.id)}
                                                        className="px-3 py-1.5 bg-rose-50 text-rose-600 font-bold rounded-lg text-xs hover:bg-rose-100 transition-all"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                        <i className="fas fa-gift text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum Gift Card Criado</h3>
                    <p className="text-slate-500 mb-6">Comece criando seu primeiro gift card.</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                        <i className="fas fa-plus mr-2"></i> Criar Primeiro Gift Card
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800">Criar Gift Card</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor (€)</label>
                                    <input
                                        type="number"
                                        value={createForm.value}
                                        onChange={(e) => setCreateForm({ ...createForm, value: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quantidade</label>
                                    <input
                                        type="number"
                                        value={createForm.quantity}
                                        onChange={(e) => setCreateForm({ ...createForm, quantity: parseInt(e.target.value) })}
                                        min="1"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expira em (meses)</label>
                                <input
                                    type="number"
                                    value={createForm.expiresInMonths}
                                    onChange={(e) => setCreateForm({ ...createForm, expiresInMonths: parseInt(e.target.value) })}
                                    min="1"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Comprado Por (opcional)</label>
                                <input
                                    type="text"
                                    value={createForm.purchasedBy}
                                    onChange={(e) => setCreateForm({ ...createForm, purchasedBy: e.target.value })}
                                    placeholder="Nome do comprador"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateGiftCards}
                                className="px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all"
                            >
                                Criar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Redeem Modal */}
            {showRedeemModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800">Resgatar Gift Card</h3>
                            <button
                                onClick={() => setShowRedeemModal(false)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Código do Gift Card</label>
                                <input
                                    type="text"
                                    value={redeemForm.code}
                                    onChange={(e) => setRedeemForm({ ...redeemForm, code: e.target.value.toUpperCase() })}
                                    placeholder="GC-XXXX-XXXX-XXXX"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor a Utilizar (€)</label>
                                <input
                                    type="number"
                                    value={redeemForm.amount}
                                    onChange={(e) => setRedeemForm({ ...redeemForm, amount: parseFloat(e.target.value) })}
                                    min="0"
                                    step="0.01"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowRedeemModal(false)}
                                className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRedeemGiftCard}
                                className="px-6 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 transition-all"
                            >
                                Resgatar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transactions Modal */}
            {showTransactionsModal && selectedCard && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Histórico de Transações</h3>
                                <p className="text-sm text-slate-500 mt-1 font-mono">{selectedCard.code}</p>
                            </div>
                            <button
                                onClick={() => setShowTransactionsModal(false)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="space-y-3">
                                {transactions.map((txn) => (
                                    <div key={txn.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div>
                                            <p className="font-bold text-sm text-slate-900">{txn.type}</p>
                                            <p className="text-xs text-slate-500">{new Date(txn.created_at).toLocaleString('pt-BR')}</p>
                                            {txn.notes && <p className="text-xs text-slate-400 mt-1">{txn.notes}</p>}
                                        </div>
                                        <span className={`text-lg font-black ${txn.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {txn.amount > 0 ? '+' : ''}€{Math.abs(txn.amount).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                                {transactions.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">Nenhuma transação ainda</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
