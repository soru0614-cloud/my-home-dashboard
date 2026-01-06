'use client';
import { useState } from 'react';
import { User, Transaction } from '@/lib/data';
import { Button } from '@/components/ui/Button';

interface AllowanceControlProps {
    users: User[];
    onAdjust: (userId: string, amount: number) => void;
}

export const AllowanceControl = ({ users, onAdjust }: AllowanceControlProps) => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [isAdding, setIsAdding] = useState(true);

    const handleAdjust = () => {
        if (!selectedUser || amount <= 0) return;
        const finalAmount = isAdding ? amount : -amount;
        onAdjust(selectedUser, finalAmount);
        setAmount(0);
        alert('용돈이 조정되었습니다.');
    };

    return (
        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'white' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--parent-text)' }}>용돈 수동 조정</h2>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                {users.map(user => (
                    <div key={user.id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>{user.profileImage}</span>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>{user.allowance.toLocaleString()}원</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user.id); setIsAdding(false); }}>-</Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user.id); setIsAdding(true); }}>+</Button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedUser && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>
                        {users.find(u => u.id === selectedUser)?.name}에게 {isAdding ? '지급' : '차감'}
                    </h4>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="number"
                            value={amount || ''}
                            onChange={e => setAmount(Number(e.target.value))}
                            placeholder="금액 입력"
                            style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                        />
                        <Button variant={isAdding ? 'primary' : 'danger'} onClick={handleAdjust}>
                            {isAdding ? '지급' : '차감'} 확인
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
