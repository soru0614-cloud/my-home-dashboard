'use client';
import { useState, useEffect } from 'react';
import { MOCK_MISSIONS, MOCK_TRANSACTIONS, MOCK_NOTICES, MOCK_VOTES, MOCK_USERS, Mission, User, Vote, Notice, Transaction } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { MissionList } from '@/components/features/MissionList';
import { TransactionList } from '@/components/features/TransactionList';
import { AllowanceControl } from '@/components/features/AllowanceControl';
import { NoticeBoard } from '@/components/features/NoticeBoard';
import { VotingSystem } from '@/components/features/VotingSystem';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ParentDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');

    const [missions, setMissions] = useState<Mission[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]); // Add state for notices
    const [votes, setVotes] = useState<Vote[]>([]); // Add state for votes
    const [editingMission, setEditingMission] = useState<Mission | null>(null);
    const [isAddingMission, setIsAddingMission] = useState(false);
    const [newMission, setNewMission] = useState<Partial<Mission>>({ title: '', stickers: 1, allowanceReward: 0, userId: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);


    // Fetch initial data from Supabase
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const { data: usersData } = await supabase.from('profiles').select('*');
            const { data: missionsData } = await supabase.from('missions').select('*').order('created_at', { ascending: false });
            const { data: transactionsData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
            const { data: noticesData } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
            const { data: votesData } = await supabase.from('votes').select('*').order('created_at', { ascending: false });

            if (usersData) setUsers(usersData as any);
            if (missionsData) setMissions(missionsData as any);
            if (transactionsData) setTransactions(transactionsData as any);
            if (noticesData) setNotices(noticesData as any);
            if (votesData) setVotes(votesData as any);
            setIsLoading(false);
        };

        fetchData();

        // Realtime Subscription
        const channel = supabase
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
                if (payload.eventType === 'INSERT') setUsers(prev => [...prev, payload.new as any]);
                if (payload.eventType === 'UPDATE') setUsers(prev => prev.map(u => u.id === payload.new.id ? payload.new as any : u));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, (payload) => {
                if (payload.eventType === 'INSERT') setMissions(prev => [payload.new as any, ...prev]);
                if (payload.eventType === 'UPDATE') setMissions(prev => prev.map(m => m.id === payload.new.id ? payload.new as any : m));
                if (payload.eventType === 'DELETE') setMissions(prev => prev.filter(m => m.id !== payload.old.id));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
                if (payload.eventType === 'INSERT') setTransactions(prev => [payload.new as any, ...prev]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, (payload) => {
                if (payload.eventType === 'INSERT') setVotes(prev => [payload.new as any, ...prev]);
                if (payload.eventType === 'UPDATE') setVotes(prev => prev.map(v => v.id === payload.new.id ? payload.new as any : v));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === '0000') {
            setIsAuthenticated(true);
        } else {
            alert('비밀번호가 틀렸습니다!');
            setPin('');
        }
    };

    const startEdit = (mission: Mission) => {
        setEditingMission(mission);
    };

    const saveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMission) return;
        await supabase.from('missions').update({
            title: editingMission.title,
            reward: editingMission.stickers,
            money: editingMission.allowanceReward,
        }).match({ id: editingMission.id });
        setEditingMission(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            await supabase.from('missions').delete().match({ id });
            // State update handled by subscription
        }
    };

    const handleAddMission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMission.title || !newMission.userId) return;

        await supabase.from('missions').insert([{
            title: newMission.title,
            reward: newMission.stickers,
            money: newMission.allowanceReward,
            user_id: newMission.userId,
            status: 'pending'
        }]);
        setIsAddingMission(false);
        setNewMission({ title: '', stickers: 1, allowanceReward: 0, userId: '' }); // Reset form
    };

    const handleReject = async (id: string) => {
        await supabase.from('missions').update({ status: 'pending' }).match({ id });
    };

    const handleApprove = async (id: string) => {
        const mission = missions.find(m => m.id === id);
        if (!mission) return;

        // Start transaction for approval (update mission + update user stats + add transaction record)
        // For simplicity, doing sequential requests. In prod, use RPC.
        await supabase.from('missions').update({ status: 'verified' }).match({ id });

        const user = users.find(u => u.id === mission.userId);
        if (user) {
            const newStickers = user.stickers + mission.stickers;
            const newAllowance = user.allowance + (mission.allowanceReward || 0);

            await supabase.from('profiles').update({ stickers: newStickers, allowance: newAllowance }).match({ id: mission.userId });

            if (mission.allowanceReward && mission.allowanceReward > 0) {
                await supabase.from('transactions').insert([{
                    amount: mission.allowanceReward,
                    description: `미션 성공: ${mission.title}`,
                    type: 'earned',
                    user_id: mission.userId
                }]);
            }
        }
    };

    const handleAllowanceAdjust = async (userId: string, amount: number) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const newAllowance = user.allowance + amount;
        await supabase.from('profiles').update({ allowance: newAllowance }).match({ id: userId });

        await supabase.from('transactions').insert([{
            amount: Math.abs(amount),
            description: amount > 0 ? '용돈 지급' : '용돈 차감',
            type: amount > 0 ? 'adjustment' : 'spent',
            user_id: userId
        }]);
    };

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--parent-primary)' }}>관리자 접속 🔒</h1>
                <form onSubmit={handleLogin} className="glass" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white' }}>
                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block' }}>비밀번호</label>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>(초기 비밀번호 0000이 설정되어 있습니다.)</span>
                    </div>
                    <input
                        type="password"
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        maxLength={4}
                        style={{ padding: '0.8rem', fontSize: '1.2rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #ccc' }}
                        autoFocus
                    />
                    <Button variant="primary" size="lg">접속하기</Button>
                    <Link href="/">
                        <Button variant="ghost">돌아가기</Button>
                    </Link>
                </form>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--parent-primary)' }}>데이터 로딩 중...</h1>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '800px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--parent-primary)' }}>부모님 대시보드 🛡️</h1>
                <Link href="/">
                    <Button variant="ghost">로그아웃</Button>
                </Link>
            </header>

            {/* Edit Modal / Form Overlay */}
            {editingMission && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <form onSubmit={saveEdit} className="glass" style={{ padding: '2rem', background: 'white', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2>미션 수정하기</h2>

                        <label>미션 이름</label>
                        <input
                            value={editingMission.title}
                            onChange={e => setEditingMission({ ...editingMission, title: e.target.value })}
                            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />

                        <label>스티커 보상 (개수)</label>
                        <input
                            type="number"
                            value={editingMission.stickers}
                            onChange={e => setEditingMission({ ...editingMission, stickers: parseInt(e.target.value) || 0 })}
                            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />

                        <label>용돈 보상 (원, 선택사항)</label>
                        <input
                            type="number"
                            value={editingMission.allowanceReward || ''}
                            onChange={e => setEditingMission({ ...editingMission, allowanceReward: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                            <Button type="button" variant="ghost" onClick={() => setEditingMission(null)}>취소</Button>
                            <Button type="submit" variant="primary">저장</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Add Mission Modal */}
            {isAddingMission && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <form onSubmit={handleAddMission} className="glass" style={{ padding: '2rem', background: 'white', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2>새 미션 추가</h2>

                        <label>아이 선택</label>
                        <select
                            value={newMission.userId}
                            onChange={e => setNewMission({ ...newMission, userId: e.target.value })}
                            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        >
                            <option value="">아이를 선택하세요</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>

                        <label>미션 이름</label>
                        <input
                            value={newMission.title}
                            onChange={e => setNewMission({ ...newMission, title: e.target.value })}
                            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                            placeholder="예: 방 청소하기"
                        />

                        <label>스티커 보상 (개수)</label>
                        <input
                            type="number"
                            value={newMission.stickers}
                            onChange={e => setNewMission({ ...newMission, stickers: parseInt(e.target.value) || 0 })}
                            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />

                        <label>용돈 보상 (원, 선택사항)</label>
                        <input
                            type="number"
                            value={newMission.allowanceReward || ''}
                            onChange={e => setNewMission({ ...newMission, allowanceReward: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                            <Button type="button" variant="ghost" onClick={() => setIsAddingMission(false)}>취소</Button>
                            <Button type="submit" variant="primary">추가</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ color: 'var(--parent-text)' }}>미션 관리</h2>
                    <Button variant="primary" onClick={() => setIsAddingMission(true)}>+ 미션 추가</Button>
                </div>
                <MissionList
                    missions={missions}
                    role="parent"
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                />
            </div>

            <AllowanceControl users={users} onAdjust={handleAllowanceAdjust} />

            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ color: 'var(--parent-text)' }}>용돈 내역 (전체)</h2>
                </div>
                <TransactionList transactions={transactions} />
            </div>

            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ color: 'var(--parent-text)' }}>우리집 게시판</h2>
                </div>
                <NoticeBoard notices={notices} />
                <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <VotingSystem
                        initialVote={votes[0]}
                        onUpdate={async (updatedVote) => {
                            await supabase.from('votes').update({
                                title: updatedVote.title,
                                options: updatedVote.options,
                                deadline: updatedVote.deadline
                            }).match({ id: updatedVote.id });
                            alert('투표가 수정되었습니다.');
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
