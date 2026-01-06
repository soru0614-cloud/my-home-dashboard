'use client';
export const StickerBoard = ({ count }: { count: number }) => {
    // 10 stickers goal
    const goal = 10;
    return (
        <div className="glass" style={{ padding: '1.5rem', background: 'white' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--child-secondary)', textAlign: 'center' }}>내 스티커 보드</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.8rem', justifyItems: 'center' }}>
                {Array.from({ length: goal }).map((_, i) => (
                    <div key={i} style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: i < count ? 'var(--child-primary)' : '#f0f0f0',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        border: i < count ? '2px solid white' : '1px dashed #ccc',
                        boxShadow: i < count ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.3s ease',
                        transform: i < count ? 'scale(1.1)' : 'scale(1)'
                    }}>
                        {i < count ? '⭐️' : ''}
                    </div>
                ))}
            </div>
            <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', color: '#555' }}>
                {count} / {goal} 개 모았어요!
            </p>
        </div>
    );
}
