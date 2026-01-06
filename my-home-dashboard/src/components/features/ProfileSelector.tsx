'use client';
import { User } from '@/lib/data';

interface ProfileSelectorProps {
    users: User[];
    onSelect: (user: User) => void;
}

export const ProfileSelector = ({ users, onSelect }: ProfileSelectorProps) => {
    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--child-secondary)', marginBottom: '1rem' }}>
                누구인가요?
            </h1>

            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {users.map(user => (
                    <div
                        key={user.id}
                        className="glass"
                        onClick={() => onSelect(user)}
                        style={{
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            width: '180px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            border: `2px solid var(--child-primary)`
                        }}
                    >
                        <div style={{ fontSize: '4rem' }}>{user.profileImage}</div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
