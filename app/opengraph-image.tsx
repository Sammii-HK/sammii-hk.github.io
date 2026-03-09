import { ImageResponse } from 'next/og';
import { getJostFont } from './lib/og-font';

export const alt = 'sammii.dev — design engineer, full-stack builder';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  const jostBold = getJostFont(600);
  const jostMedium = getJostFont(500);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '80px',
          background: '#000',
          position: 'relative',
          fontFamily: 'Jost',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: [
              'radial-gradient(ellipse at 20% 20%, rgba(147, 51, 234, 0.35) 0%, transparent 50%)',
              'radial-gradient(ellipse at 80% 75%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(ellipse at 60% 5%, rgba(236, 72, 153, 0.2) 0%, transparent 40%)',
            ].join(', '),
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          <span
            style={{
              color: '#a78bfa',
              fontSize: '22px',
              fontWeight: 500,
              letterSpacing: '2px',
              fontFamily: 'Jost',
            }}
          >
            sammii.dev
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span
              style={{
                color: '#ffffff',
                fontSize: '72px',
                fontWeight: 600,
                lineHeight: 1.1,
                fontFamily: 'Jost',
              }}
            >
              Design engineer.
            </span>
            <span
              style={{
                color: '#ffffff',
                fontSize: '72px',
                fontWeight: 600,
                lineHeight: 1.1,
                fontFamily: 'Jost',
              }}
            >
              Full-stack builder.
            </span>
          </div>
          <span style={{ color: '#9ca3af', fontSize: '26px', fontFamily: 'Jost', fontWeight: 500 }}>
            Building products, autonomous AI pipelines, and creative tools
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Jost', data: jostBold, weight: 600, style: 'normal' },
        { name: 'Jost', data: jostMedium, weight: 500, style: 'normal' },
      ],
    },
  );
}
