'use client';
import { Button } from '@/components/ui/Button';

export const SuggestionBox = () => {
    return (
        <div className="glass" style={{ padding: '1.5rem', marginTop: '1rem', background: '#fff' }}>
            <h3 style={{ marginBottom: '1rem', color: '#555', fontSize: '1.2rem' }}>💡 우리가족 건의함</h3>
            <textarea
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                placeholder="오늘 저녁엔 피자 먹고 싶어요..."
            />
            <div style={{ textAlign: 'right' }}>
                <Button variant="child" size="sm">보내기</Button>
            </div>
        </div>
    );
}
