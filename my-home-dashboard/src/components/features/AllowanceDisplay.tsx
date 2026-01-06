'use client';
export const AllowanceDisplay = ({ balance }: { balance: number }) => {
    return (
        <div className="glass" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '2rem',
            textAlign: 'center',
            borderRadius: '16px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
        }}>
            <h3 style={{ marginBottom: '0.5rem', opacity: 0.9, fontSize: '1.2rem' }}>현재 잔액</h3>
            <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                {balance.toLocaleString()} 원
            </div>
        </div>
    );
}
