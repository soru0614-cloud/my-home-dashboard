'use client';
import { useState, useEffect } from 'react';
import { MOCK_MISSIONS, MOCK_USERS, MOCK_TRANSACTIONS, MOCK_NOTICES, MOCK_VOTES, User, Mission, Transaction, Notice, Vote } from '@/lib/data';
import { supabase } from '@/lib/supabase';
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
    const [missions, setMissions] = useState<Mission[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
            .channel('db-changes-child')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
                if (payload.eventType === 'INSERT') setUsers(prev => [...prev, payload.new as any]);
                if (payload.eventType === 'UPDATE') {
                    setUsers(prev => prev.map(u => u.id === payload.new.id ? payload.new as any : u));
                    // Update current user if it matches
                    if (user && user.id === payload.new.id) {
                        setUser(payload.new as any);
                    }
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, (payload) => {
                if (payload.eventType === 'INSERT') setMissions(prev => [payload.new as any, ...prev]);
                if (payload.eventType === 'UPDATE') setMissions(prev => prev.map(m => m.id === payload.new.id ? payload.new as any : m));
                if (payload.eventType === 'DELETE') setMissions(prev => prev.filter(m => m.id !== payload.old.id));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
                if (payload.eventType === 'INSERT') setTransactions(prev => [payload.new as any, ...prev]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, (payload) => {
                // For now just basic updates
                if (payload.eventType === 'INSERT') setNotices(prev => [payload.new as any, ...prev]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, (payload) => {
                if (payload.eventType === 'INSERT') setVotes(prev => [payload.new as any, ...prev]);
                if (payload.eventType === 'UPDATE') setVotes(prev => prev.map(v => v.id === payload.new.id ? payload.new as any : v));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Save to Supabase when user updates profile
    const handleProfileUpdate = async (newEmoji: string) => {
        if (!user) return;
        const updatedUser = { ...user, profileImage: newEmoji };
        setUser(updatedUser); // Optimistic update
        setIsEditingProfile(false);

        await supabase.from('profiles').update({
            profile_image: newEmoji
        }).match({ id: user.id });
    };

    const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'];

    // Filter data for selected user
    const userMissions = missions.filter(m => m.userId === user?.id);
    const userTransactions = transactions.filter(t => t.userId === user?.id);

    const handleComplete = async (id: string) => {
        // Optimistic update
        setMissions(missions.map(m =>
            m.id === id ? { ...m, status: 'completed' } : m
        ));

        await supabase.from('missions').update({ status: 'completed' }).match({ id });
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
                        <NoticeBoard notices={notices} readOnly={true} />
                        <SuggestionBox />
                        <div style={{ marginTop: '1rem' }}>
                            <VotingSystem
                                initialVote={votes[0]}
                                userId={user.id}
                                onUpdate={async (updatedVote) => {
                                    // Handle voting update (increment count)
                                    await supabase.from('votes').update({
                                        options: updatedVote.options,
                                        hasVotedUsers: updatedVote.hasVotedUsers
                                    }).match({ id: updatedVote.id });
                                }}
                            />
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
