import { ImageResponse } from 'next/og';
import { getPostBySlug, getAllSlugs } from '../../lib/blog';
import { getJostFont } from '../../lib/og-font';

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ slug: string }> };

export async function generateAlt({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return post?.title ?? 'Blog post — sammii.dev';
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? 'Blog post';
  const date = post
    ? new Date(post.date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';
  const readingTime = post?.readingTime ?? '';
  const titleFontSize = title.length > 70 ? 40 : title.length > 50 ? 48 : title.length > 35 ? 56 : 64;

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
          justifyContent: 'space-between',
          padding: '72px 80px',
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
              'radial-gradient(ellipse at 10% 20%, rgba(147, 51, 234, 0.4) 0%, transparent 45%)',
              'radial-gradient(ellipse at 90% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 45%)',
              'radial-gradient(ellipse at 70% 5%, rgba(236, 72, 153, 0.2) 0%, transparent 35%)',
            ].join(', '),
          }}
        />

        {/* Top: branding */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
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
        </div>

        {/* Middle: title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flex: 1,
            justifyContent: 'center',
            padding: '32px 0',
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontSize: `${titleFontSize}px`,
              fontWeight: 600,
              lineHeight: 1.2,
              maxWidth: '960px',
              fontFamily: 'Jost',
            }}
          >
            {title}
          </span>
        </div>

        {/* Bottom: date + reading time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
          {date && (
            <span style={{ color: '#6b7280', fontSize: '22px', fontFamily: 'Jost' }}>{date}</span>
          )}
          {readingTime && (
            <>
              <span style={{ color: '#374151', fontSize: '22px' }}>·</span>
              <span style={{ color: '#6b7280', fontSize: '22px', fontFamily: 'Jost' }}>{readingTime}</span>
            </>
          )}
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
