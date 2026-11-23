import { SITE_HOST } from './seo';

export const OG_ALT = 'Livio - PG Near Me | Verified Paying Guest, Hostel & Co-Living';
export const OG_SIZE = { width: 1200, height: 630 };

export function OgImageBody() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #4c1d95 100%)',
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
            fontSize: '40px',
            fontWeight: 800,
          }}
        >
          L
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '34px', fontWeight: 800 }}>Livio</span>
          <span style={{ fontSize: '22px', color: '#fda4af', fontWeight: 600 }}>
            PG Near Me
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <span style={{ fontSize: '76px', fontWeight: 800, lineHeight: 1.05 }}>
          Find a PG Near Me
        </span>
        <span style={{ fontSize: '32px', color: '#cbd5e1', fontWeight: 500 }}>
          Verified Paying Guest, Hostel &amp; Co-Living Stays
        </span>
        <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
          {['PG for Boys', 'PG for Girls', 'Student PG', 'Coliving PG'].map(
            (tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '22px',
                  fontWeight: 600,
                  padding: '10px 22px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                {tag}
              </span>
            )
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '24px',
          color: '#94a3b8',
          fontWeight: 600,
        }}
      >
        <span>{SITE_HOST}</span>
        <span>Search. Compare. Move in.</span>
      </div>
    </div>
  );
}
