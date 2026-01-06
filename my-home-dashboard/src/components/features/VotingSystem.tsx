'use client';
import { useState } from 'react';
import { Vote } from '@/lib/data';
import { Button } from '@/components/ui/Button';

export const VotingSystem = ({ initialVote, userId, onUpdate }: { initialVote: Vote, userId?: string, onUpdate?: (vote: Vote) => void }) => {
    const [vote, setVote] = useState(initialVote);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const isExpired = vote.deadline ? new Date() > new Date(vote.deadline) : false;
    const hasVoted = userId ? vote.hasVotedUsers.includes(userId) : false;

    const getDDay = () => {
        if (!vote.deadline) return '';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = new Date(vote.deadline);
        deadline.setHours(0, 0, 0, 0);
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'D+' + Math.abs(diffDays);
        if (diffDays === 0) return 'D-Day';
        return 'D-' + diffDays;
    };

    const totalVotes = vote.options.reduce((acc, curr) => acc + curr.count, 0);

    const handleVote = () => {
        if (!selectedOption || !userId) return;
        setVote({
            ...vote,
            options: vote.options.map(opt =>
                opt.id === selectedOption ? { ...opt, count: opt.count + 1 } : opt
            ),
            hasVotedUsers: [...vote.hasVotedUsers, userId]
        });
    };

    return (
        <div className="glass" style={{ padding: '1.5rem', background: '#fff', position: 'relative' }}>
            {/* Edit Button for Parent (implied by lack of userId or checking role, but here just showing it always for MVP or if onUpdate exists) */}
            {onUpdate && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>⚙️</Button>
                </div>
            )}

            {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        value={vote.title}
                        onChange={e => setVote({ ...vote, title: e.target.value })}
                        style={{ padding: '0.5rem', fontWeight: 'bold' }}
                    />
                    <label style={{ fontSize: '0.9rem' }}>마감 시간</label>
                    <input
                        type="datetime-local"
                        value={vote.deadline || ''}
                        onChange={e => setVote({ ...vote, deadline: e.target.value })}
                        style={{ padding: '0.5rem' }}
                    />

                    <label style={{ fontSize: '0.9rem' }}>투표 항목</label>
                    {vote.options.map((opt, idx) => (
                        <div key={opt.id} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                value={opt.label}
                                onChange={e => {
                                    const newOptions = [...vote.options];
                                    newOptions[idx] = { ...opt, label: e.target.value };
                                    setVote({ ...vote, options: newOptions });
                                }}
                                style={{ flex: 1, padding: '0.5rem' }}
                            />
                            <Button variant="danger" size="sm" onClick={() => {
                                setVote({ ...vote, options: vote.options.filter(o => o.id !== opt.id) });
                            }}>삭제</Button>
                        </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => {
                        setVote({ ...vote, options: [...vote.options, { id: Date.now().toString(), label: '', count: 0 }] });
                    }}>+ 항목 추가</Button>

                    <Button variant="primary" onClick={() => { setIsEditing(false); onUpdate?.(vote); }}>저장</Button>
                </div>
            ) : (
                <>
                    <h3 style={{ marginBottom: '1rem', color: '#555', textAlign: 'center' }}>
                        🗳️ {vote.title}
                        {vote.deadline && (
                            <span style={{ fontSize: '0.9rem', color: isExpired ? 'red' : 'blue', marginLeft: '0.5rem', fontWeight: 'bold' }}>
                                {getDDay()}
                            </span>
                        )}
                        {isExpired && <span style={{ color: 'red', fontSize: '0.8rem', marginLeft: '0.5rem' }}>(마감)</span>}
                    </h3>

                    {(!hasVoted && !isExpired) ? (
                        <div style={{ display: 'grid', gap: '0.8rem' }}>
                            {vote.options.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSelectedOption(opt.id)}
                                    disabled={isExpired}
                                    style={{
                                        padding: '1rem',
                                        border: selectedOption === opt.id ? '2px solid var(--child-secondary)' : '1px solid #ddd',
                                        borderRadius: '12px',
                                        background: selectedOption === opt.id ? '#f0f9ff' : (isExpired ? '#f5f5f5' : 'white'),
                                        cursor: isExpired ? 'not-allowed' : 'pointer',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s',
                                        opacity: isExpired ? 0.7 : 1
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                            <Button
                                variant="primary"
                                onClick={handleVote}
                                disabled={!selectedOption || !userId}
                                style={{ marginTop: '0.5rem', opacity: selectedOption ? 1 : 0.5 }}
                            >
                                투표하기!
                            </Button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.8rem' }}>
                            {vote.options.map(opt => {
                                const percentage = totalVotes === 0 ? 0 : Math.round((opt.count / totalVotes) * 100);
                                return (
                                    <div key={opt.id} style={{ position: 'relative', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.9rem' }}>
                                            <span>{opt.label}</span>
                                            <span style={{ fontWeight: 'bold' }}>{percentage}% ({opt.count})</span>
                                        </div>
                                        <div style={{ height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${percentage}%`,
                                                background: 'var(--child-accent)',
                                                transition: 'width 0.5s ease'
                                            }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                투표해줘서 고마워요!
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
