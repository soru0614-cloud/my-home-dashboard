'use client';
import { useState, useEffect } from 'react';
import { MOCK_MISSIONS, MOCK_USERS, MOCK_TRANSACTIONS, MOCK_NOTICES, MOCK_VOTES, User } from '@/lib/data';
import { StickerBoard } from '@/components/features/StickerBoard';
import { MissionList } from '@/components/features/MissionList';
import { AllowanceDisplay } from '@/components/features/AllowanceDisplay';
import { TransactionList } from '@/components/features/TransactionList';
import { NoticeBoard } from '@/components/features/NoticeBoard';
import { SuggestionBox } from '@/components/features/SuggestionBox';
import { VotingSystem } from '@/components/features/VotingSystem';
import { ProfileSelector } from '@/components/features/ProfileSelector';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ChildDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [missions, setMissions] = useState(MOCK_MISSIONS);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [users, setUsers] = useState(MOCK_USERS);

    // Initialize from localStorage on mount and sync
    useEffect(() => {
        const savedUsers = localStorage.getItem('magnetar_users');
        if (savedUsers) {
            const parsedUsers = JSON.parse(savedUsers);
            // Only update users list if changed, prevents loop if we rely on it, but setUsers is safe-ish. 
            // Better to just set it. 
            setUsers(parsedUsers);

            if (user) {
                const updatedUser = parsedUsers.find((u: User) => u.id === user.id);
                // Prevent infinite loop by comparing stringified objects
                if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(user)) {
                    setUser(updatedUser);
                }
            }
        }
    }, [user]);

    // Save to localStorage when user updates profile
    const handleProfileUpdate = (newEmoji: string) => {
        if (!user) return;
        const updatedUser = { ...user, profileImage: newEmoji };
        setUser(updatedUser);
        setIsEditingProfile(false);

        // Update in localStorage
        const savedUsers = localStorage.getItem('magnetar_users');
        const currentUsers = savedUsers ? JSON.parse(savedUsers) : MOCK_USERS;
        const newUsers = currentUsers.map((u: User) => u.id === user.id ? updatedUser : u);
        localStorage.setItem('magnetar_users', JSON.stringify(newUsers));
        setUsers(newUsers); // Update local users list

        // Dispatch storage event for other tabs
        window.dispatchEvent(new Event('storage'));
    };

    const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'];

    // Filter data for selected user
    const userMissions = missions.filter(m => m.userId === user?.id);
    const userTransactions = MOCK_TRANSACTIONS.filter(t => t.userId === user?.id);

    const handleComplete = (id: string) => {
        setMissions(missions.map(m =>
            m.id === id ? { ...m, status: 'completed' } : m
        ));
    };

    if (!user) {
        return <ProfileSelector users={users} onSelect={setUser} />;
    }

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '800px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--child-secondary)', fontSize: '2rem' }}>
                    안녕, {user.name}! {user.profileImage}
                </h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="ghost" onClick={() => setIsEditingProfile(true)}>프로필 변경</Button>
                    <Link href="/">
                        <Button variant="ghost">나가기</Button>
                    </Link>
                </div>
            </header>

            {/* Profile Edit Modal */}
            {isEditingProfile && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass" style={{ padding: '2rem', background: 'white', maxWidth: '600px', width: '90%' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>프로필 사진 바꾸기</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '0.5rem', marginBottom: '1.5rem', justifyItems: 'center' }}>
                            {EMOJIS.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => handleProfileUpdate(emoji)}
                                    style={{
                                        fontSize: '2.5rem',
                                        padding: '0.5rem',
                                        background: user.profileImage === emoji ? '#fef3c7' : 'transparent',
                                        border: user.profileImage === emoji ? '2px solid #f59e0b' : '1px solid #eee',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        width: '70px',
                                        height: '70px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Button variant="ghost" onClick={() => setIsEditingProfile(false)}>닫기</Button>
                            <Button variant="secondary" onClick={() => setUser(null)} style={{ marginLeft: '1rem' }}>다른 아이로 로그인</Button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr' }}>
                <section>
                    <h2 style={{ marginBottom: '1rem', color: '#555', fontSize: '1.5rem' }}>내 지갑 💰</h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <AllowanceDisplay balance={user.allowance} />
                        <TransactionList transactions={userTransactions} />
                    </div>
                </section>

                <section>
                    <StickerBoard count={user.stickers} />
                    <div style={{ marginTop: '2rem' }}>
                        <NoticeBoard notices={MOCK_NOTICES} readOnly={true} />
                        <SuggestionBox />
                        <div style={{ marginTop: '1rem' }}>
                            <VotingSystem initialVote={MOCK_VOTES[0]} userId={user.id} />
                        </div>
                    </div>
                </section>

                <section>
                    <h2 style={{ marginBottom: '1rem', color: '#555', fontSize: '1.5rem' }}>오늘의 미션</h2>
                    <MissionList
                        missions={userMissions}
                        role="child"
                        onComplete={handleComplete}
                    />
                </section>
            </div>
        </div>
    );
}
