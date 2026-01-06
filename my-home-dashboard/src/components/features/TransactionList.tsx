'use client';
import { Transaction } from '@/lib/data';

export const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
    return (
        <div className="glass" style={{ padding: '1.5rem', background: 'white' }}>
            <h3 style={{ marginBottom: '1rem', color: '#555' }}>최근 활동</h3>
            <ul style={{ listStyle: 'none' }}>
                {transactions.map(t => (
                    <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', color: '#333' }}>{t.description}</div>
                            <div style={{ fontSize: '0.85rem', color: '#999' }}>{t.date}</div>
                        </div>
                        <div style={{ color: t.type === 'income' ? '#32CD32' : '#ef4444', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()} 원
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
