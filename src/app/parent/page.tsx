'use client';
import { useState, useEffect } from 'react';
import { MOCK_MISSIONS, MOCK_TRANSACTIONS, MOCK_NOTICES, MOCK_VOTES, MOCK_USERS, Mission } from '@/lib/data';
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

    const [missions, setMissions] = useState(MOCK_MISSIONS);
    const [users, setUsers] = useState(MOCK_USERS);
    const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
    const [notices, setNotices] = useState(MOCK_NOTICES); // Add state for notices
    const [votes, setVotes] = useState(MOCK_VOTES); // Add state for votes
    const [editingMission, setEditingMission] = useState<Mission | null>(null);
    const [isAddingMission, setIsAddingMission] = useState(false);
    const [newMission, setNewMission] = useState<Partial<Mission>>({ title: '', stickers: 1, allowanceReward: 0, userId: MOCK_USERS[0].id });

    // Load users from localStorage on mount
    useEffect(() => {
        const savedUsers = localStorage.getItem('magnetar_users');
        if (savedUsers) {
            setUsers(JSON.parse(savedUsers));
        } else {
            // Initialize localStorage if empty
            localStorage.setItem('magnetar_users', JSON.stringify(MOCK_USERS));
        }

        const handleStorageChange = () => {
            const saved = localStorage.getItem('magnetar_users');
            if (saved) setUsers(JSON.parse(saved));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
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

    const handleApprove = (id: string) => {
        setMissions(missions.map(m =>
            m.id === id ? { ...m, status: 'approved' } : m
        ));
        // In real app, increment sticker count for child via API
    };

    const startEdit = (mission: Mission) => {
        setEditingMission(mission);
    };

    const saveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMission) return;
        setMissions(missions.map(m => m.id === editingMission.id ? editingMission : m));
        setEditingMission(null);
        setEditingMission(null);
    };

    const handleReject = (id: string) => {
        setMissions(missions.map(m =>
            m.id === id ? { ...m, status: 'pending' } : m
        ));
    };

    const handleDelete = (id: string) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            setMissions(missions.filter(m => m.id !== id));
        }
    };

    const handleAddMission = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMission.title || !newMission.userId) return;

        const mission: Mission = {
            id: Date.now().toString(),
            userId: newMission.userId,
            title: newMission.title,
            stickers: newMission.stickers || 1,
            allowanceReward: newMission.allowanceReward,
            status: 'pending'
        };

        setMissions([...missions, mission]);
        setIsAddingMission(false);
        setNewMission({ title: '', stickers: 1, allowanceReward: 0, userId: MOCK_USERS[0].id });
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
                <h2 style={{ marginBottom: '1rem', color: 'var(--parent-text)' }}>미션 관리</h2>
                <MissionList
                    missions={missions}
                    role="parent"
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                />
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <Button variant="primary" size="sm" onClick={() => setIsAddingMission(true)}>+ 미션 추가</Button>
                </div>
            </div>

            <AllowanceControl users={users} onAdjust={(u, a) => {
                setUsers(users.map(user => user.id === u ? { ...user, allowance: user.allowance + a } : user));
                const newTx: any = { id: Date.now().toString(), userId: u, date: new Date().toISOString().split('T')[0], amount: Math.abs(a), description: a > 0 ? '부모님 용돈 지급' : '부모님 용돈 차감', type: a > 0 ? 'income' : 'expense' };
                setTransactions([newTx, ...transactions]);
            }} />

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
                {/* Notices now handle editing internally, but ideally we lift state if we want persistence across reloads simulated better. 
                    Simple pass-through for now as NoticeBoard handles its own editing via initialNotices, 
                    but to make it 'real' we should probably lift state or pass a handler. 
                    Given the NoticeBoard impl uses internal state initialized from props, 
                    we'll just let it be independent for MVP or update it to use controlled state if preferred.
                    The previous step implemented internal state in NoticeBoard. 
                    So we don't strictly need onUpdate unless we want to reflect it elsewhere. 
                    We will leave it as is but pass key to force re-render if needed? No, internal state is fine for now.
                 */}
                <NoticeBoard notices={notices} />
                <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <VotingSystem
                        initialVote={votes[0]}
                        onUpdate={(updatedVote) => {
                            setVotes(votes.map(v => v.id === updatedVote.id ? updatedVote : v));
                            alert('투표가 수정되었습니다.');
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
