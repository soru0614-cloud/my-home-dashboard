'use client';
import { useState } from 'react';
import { Mission } from '@/lib/data';
import { Button } from '@/components/ui/Button';

interface MissionListProps {
    missions: Mission[];
    role: 'parent' | 'child';
    onComplete?: (id: string) => void;
    onApprove?: (id: string) => void;
    onEdit?: (mission: Mission) => void;
    onDelete?: (id: string) => void;
    onReject?: (id: string) => void;
}

export const MissionList = ({ missions, role, onComplete, onApprove, onEdit, onDelete, onReject }: MissionListProps) => {
    const [tab, setTab] = useState<'active' | 'history'>('active');

    // Filter missions based on tab
    const activeMissions = missions.filter(m => m.status !== 'approved');
    const historyMissions = missions.filter(m => m.status === 'approved').sort((a, b) =>
        (b.completedAt || '').localeCompare(a.completedAt || '')
    );

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            {role === 'parent' && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                    <Button
                        variant={tab === 'active' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setTab('active')}
                    >
                        진행 중
                    </Button>
                    <Button
                        variant={tab === 'history' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setTab('history')}
                    >
                        지난 내역
                    </Button>
                </div>
            )}

            {(role === 'child' || tab === 'active' ? activeMissions : historyMissions).map((mission) => (
                <div key={mission.id} className="glass" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: mission.status === 'approved' ? 0.8 : 1 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>{mission.title}</h3>
                            {mission.completedAt && <span style={{ fontSize: '0.8rem', color: '#999' }}>({mission.completedAt})</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: '#666', backgroundColor: '#eee', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                                스티커 {mission.stickers}개
                            </span>
                            {mission.allowanceReward && (
                                <span style={{ fontSize: '0.9rem', color: '#16a34a', backgroundColor: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 'bold' }}>
                                    용돈 {mission.allowanceReward.toLocaleString()}원
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        {role === 'child' && mission.status === 'pending' && (
                            <Button variant="child" size="sm" onClick={() => onComplete?.(mission.id)}>
                                완료!
                            </Button>
                        )}
                        {role === 'parent' && mission.status === 'completed' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button variant="primary" size="sm" onClick={() => onApprove?.(mission.id)}>
                                    승인
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => onReject?.(mission.id)} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                                    반려
                                </Button>
                            </div>
                        )}
                        {role === 'child' && mission.status === 'completed' && (
                            <span style={{ color: 'orange', fontWeight: 'bold' }}>승인 대기 중...</span>
                        )}
                        {mission.status === 'approved' && (
                            <span style={{ color: 'var(--child-accent)', fontWeight: 'bold' }}>완료됨!</span>
                        )}
                        {role === 'parent' && mission.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ color: '#999', fontSize: '0.9rem' }}>진행 중</span>
                                <Button variant="ghost" size="sm" onClick={() => onEdit?.(mission)}>수정</Button>
                                <Button variant="danger" size="sm" onClick={() => onDelete?.(mission.id)}>삭제</Button>
                            </div>
                        )}
                        {role === 'parent' && tab === 'history' && (
                            <Button variant="danger" size="sm" onClick={() => onDelete?.(mission.id)}>삭제</Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
