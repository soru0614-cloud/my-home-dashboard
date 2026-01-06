import Link from 'next/link';

export default function Home() {
  return (
    <main className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--parent-text)', marginBottom: '1rem' }}>
        누구신가요?
      </h1>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/parent" className="glass" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '200px', cursor: 'pointer', transition: 'transform 0.2s', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '3rem' }}>👨‍👩‍👧‍👦</div>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>부모님</span>
        </Link>

        <Link href="/child" className="glass" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '200px', cursor: 'pointer', transition: 'transform 0.2s', borderColor: 'var(--child-primary)', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '3rem' }}>🐣</div>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>어린이</span>
        </Link>
      </div>
    </main>
  );
}
