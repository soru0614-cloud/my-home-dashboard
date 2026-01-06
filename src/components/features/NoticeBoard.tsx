'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export const NoticeBoard = ({ notices: initialNotices, readOnly = false }: { notices: string[], readOnly?: boolean }) => {
    const [notices, setNotices] = useState(initialNotices);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(initialNotices.join('\n'));

    const handleSave = () => {
        setNotices(editContent.split('\n').filter(n => n.trim() !== ''));
        setIsEditing(false);
    };
    return (
        <div className="glass" style={{
            padding: '1.5rem',
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '20px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
                <h3 style={{ color: '#b45309', margin: 0 }}>📢 우리집 공지사항</h3>
                {!readOnly && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? '취소' : '수정'}
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        style={{ width: '100%', minHeight: '100px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #fcd34d' }}
                    />
                    <Button variant="primary" size="sm" onClick={handleSave}>저장하기</Button>
                </div>
            ) : (
                <ul style={{ paddingLeft: '1.2rem', color: '#92400e' }}>
                    {notices.map((n, i) => (
                        <li key={i} style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{n}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
