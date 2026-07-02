import { useState, useRef, useEffect } from 'react';
import AppModal from '../common/AppModal';
import { DownloadOutlined } from '@ant-design/icons';
import { STD_OPTIONS, EXAMS, MONTHS } from '../../utils/constants';

const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const RANKS = STD_OPTIONS;

/* ── ClassicView (original design) ── */
function ClassicView({ student, form, percentage, autoGrade, logoSrc }) {
  const gold = '#C9A84C';
  const dark = '#1a1a1a';
  const cream = '#fdf8ee';

  return (
    <div style={{
      width: '100%', maxWidth: 740, height: 450, margin: '0 auto',
      background: cream,
      border: `14px solid ${dark}`,
      outline: `5px solid ${gold}`,
      outlineOffset: '-20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Georgia, "Times New Roman", serif',
      boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
    }}>

      {/* ── Watermark ── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0, pointerEvents: 'none', zIndex: 0,
        overflow: 'hidden',
      }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            fontSize: 48, fontWeight: 900, color: gold,
            opacity: 0.045, whiteSpace: 'nowrap', letterSpacing: 10,
            fontFamily: 'Arial, sans-serif', lineHeight: 1.8,
            transform: 'rotate(-15deg)',
            userSelect: 'none',
          }}>
            SHREE RAM ACADEMY &nbsp;&nbsp; SHREE RAM ACADEMY &nbsp;&nbsp; SHREE RAM ACADEMY
          </div>
        ))}
      </div>

      {/* ── Corner ornaments ── */}
      {[
        { top: 8,    left: 8,    br: '0 0 100% 0' },
        { top: 8,    right: 8,   br: '0 0 0 100%' },
        { bottom: 8, left: 8,    br: '0 100% 0 0' },
        { bottom: 8, right: 8,   br: '100% 0 0 0' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', width: 42, height: 42,
          border: `3px solid ${gold}`,
          borderRadius: s.br, zIndex: 1,
          ...s,
        }} />
      ))}

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 2, padding: '16px 52px 20px' }}>

        {/* Header — matches app navbar */}
        <div style={{
          background: 'linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 50%,#0a0a0a 100%)',
          margin: '-24px -52px 0',
          borderBottom: `2px solid ${gold}`,
          display: 'flex', alignItems: 'center', padding: '10px 28px', gap: 16,
          position: 'relative',
        }}>
          {/* Logo — left */}
          <img src={logoSrc} alt="Shree Ram Academy"
            style={{ width: 72, height: 72, borderRadius: '50%', border: `2px solid ${gold}`, objectFit: 'cover', flexShrink: 0 }} />

          {/* Academy name — absolute center */}
          <div style={{ position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: gold, letterSpacing: '0.18em', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                SHREE RAM ACADEMY
              </div>
              <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${gold}88,transparent)`, margin: '7px auto', width: '80%' }} />
              <div style={{ fontSize: 10, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.65)', fontFamily: 'sans-serif', fontWeight: 600 }}>
                SINCE 2016  ·  EXCELLENCE IN EDUCATION
              </div>
            </div>
          </div>

          {/* Best Award Badge — exact match */}
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <svg width="80" height="106" viewBox="0 0 80 106" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="tailG" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f5e070"/>
                  <stop offset="50%" stopColor="#C9A84C"/>
                  <stop offset="100%" stopColor="#7a5c0a"/>
                </linearGradient>
                <linearGradient id="ringG" x1="10%" y1="0%" x2="90%" y2="100%">
                  <stop offset="0%" stopColor="#fff0a0"/>
                  <stop offset="25%" stopColor="#C9A84C"/>
                  <stop offset="60%" stopColor="#f0d060"/>
                  <stop offset="100%" stopColor="#7a5c0a"/>
                </linearGradient>
                <radialGradient id="navyG" cx="40%" cy="33%" r="68%">
                  <stop offset="0%" stopColor="#2535b0"/>
                  <stop offset="60%" stopColor="#0f1560"/>
                  <stop offset="100%" stopColor="#060920"/>
                </radialGradient>
                <filter id="bsh" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/>
                </filter>
              </defs>

              {/* Ribbon tails */}
              <polygon points="40,67 25,67 16,104 25,97 32,104" fill="url(#tailG)"/>
              <line x1="32.5" y1="67" x2="24" y2="100" stroke="#a07820" strokeWidth="0.7" opacity="0.5"/>
              <polygon points="40,67 55,67 64,104 55,97 48,104" fill="url(#tailG)"/>
              <line x1="47.5" y1="67" x2="56" y2="100" stroke="#a07820" strokeWidth="0.7" opacity="0.5"/>

              {/* Starburst outer ring — 20 points */}
              {(() => {
                const cx=40, cy=37, oR=35, iR=29, pts=20;
                let d='';
                for(let i=0;i<pts*2;i++){
                  const r=i%2===0?oR:iR;
                  const a=(i*Math.PI/pts)-Math.PI/2;
                  d+=(i===0?'M':'L')+`${(cx+r*Math.cos(a)).toFixed(2)},${(cy+r*Math.sin(a)).toFixed(2)}`;
                }
                return <path d={d+'Z'} fill="url(#ringG)" filter="url(#bsh)"/>;
              })()}

              <circle cx="40" cy="37" r="28" fill="none" stroke="#f0d060" strokeWidth="1.2"/>
              <circle cx="40" cy="37" r="27" fill="url(#navyG)"/>
              <circle cx="40" cy="37" r="24.5" fill="none" stroke="#C9A84C" strokeWidth="1"/>

              <text x="40" y="32" textAnchor="middle" fill="#f0d060"
                fontSize="12" fontStyle="italic" fontWeight="700"
                fontFamily="Georgia,'Times New Roman',serif">Best</text>
              <text x="40" y="42" textAnchor="middle" fill="#ffffff"
                fontSize="8.5" fontWeight="900" letterSpacing="1.5"
                fontFamily="Arial Black,Arial,sans-serif">AWARD</text>
              <text x="40" y="51" textAnchor="middle" fill="#C9A84C"
                fontSize="7" fontFamily="Arial,sans-serif" letterSpacing="1">★ ★ ★</text>
            </svg>
          </div>
        </div>

        {/* Certificate title */}
        <div style={{ textAlign: 'center', padding: '6px 52px 0', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: dark, letterSpacing: 6, fontFamily: 'Arial Black, Arial, sans-serif', textTransform: 'uppercase', lineHeight: 1 }}>
            Certificate
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '5px 0 3px' }}>
            <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to right, transparent, ${gold})` }} />
            <span style={{ fontSize: 10, letterSpacing: 4, color: gold, fontFamily: 'Arial,sans-serif', fontWeight: 700, textTransform: 'uppercase' }}>
              Of Achievement
            </span>
            <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to left, transparent, ${gold})` }} />
          </div>
          <div style={{ marginBottom: 8 }} />
        </div>

        {/* Presented to */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <p style={{ fontSize: 9, color: '#888', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Arial,sans-serif', marginBottom: 4 }}>
            This Certificate is Proudly Presented to
          </p>
          <p style={{ fontSize: 28, color: dark, fontStyle: 'italic', margin: '0 0 2px', lineHeight: 1.2 }}>
            {student.name}
          </p>
          <div style={{ width: 180, height: 2, background: `linear-gradient(90deg,transparent,${gold},transparent)`, margin: '5px auto 8px' }} />
        </div>

        {/* Body text */}
        <p style={{ textAlign: 'center', fontSize: 10.5, color: '#444', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 10px', fontFamily: 'Georgia,serif' }}>
          This is to certify that <strong style={{ color: dark }}>{student.name}</strong> has successfully attained{' '}
          <strong style={{ color: dark }}>
            {form.marksObtained || '__'}/{form.totalMarks || '__'} Marks
            {percentage !== null ? ` (${percentage}%)` : ''}
            {autoGrade ? ` — Grade ${autoGrade}` : ''}
          </strong>{' '}
          and has been honoured with the <strong style={{ color: gold, fontSize: 12 }}>{form.rank} Rank</strong> in{' '}
          <strong style={{ color: dark }}>{form.examName}</strong>
          {form.subject ? <> — <strong style={{ color: dark }}>{form.subject}</strong></> : ''},{' '}
          Class <strong style={{ color: dark }}>{student.std}</strong>, in recognition of outstanding academic performance and unwavering dedication to excellence.
        </p>

        {/* Divider */}
        <div style={{ borderTop: `1.5px dashed ${gold}`, opacity: 0.4, margin: '0 40px 10px' }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#555', letterSpacing: 1, fontFamily: 'Arial', marginBottom: 6 }}>
              {form.month} {form.year}
            </div>
            <div style={{ width: 130, borderBottom: `2px solid ${dark}`, marginBottom: 4 }} />
            <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Date</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src={logoSrc} alt="seal"
              style={{ width: 56, height: 56, borderRadius: '50%', opacity: 0.4, marginBottom: 4, objectFit: 'contain', background: cream, imageRendering: 'high-quality' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/signature.png" alt="Signature"
              style={{ height: 48, maxWidth: 140, objectFit: 'contain', marginBottom: 2, display: 'block', margin: '0 auto 2px' }} />
            <div style={{ width: 140, borderBottom: `2px solid ${dark}`, margin: '0 auto 4px' }} />
            <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>
              Owner / Director
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── ModernView ── */
function ModernView({ student, form, percentage, autoGrade, logoSrc }) {
  const navy = '#1e3a5f';
  const gold = '#C9A84C';

  return (
    <div style={{
      width: '100%', maxWidth: 740, height: 450, margin: '0 auto',
      background: '#ffffff',
      border: `4px solid ${navy}`,
      outline: `2px solid ${gold}`,
      outlineOffset: '-14px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Helvetica, Arial, sans-serif',
      boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
    }}>

      {/* Watermark — faint navy diagonal */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0, pointerEvents: 'none', zIndex: 0,
        overflow: 'hidden',
      }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            fontSize: 48, fontWeight: 900, color: navy,
            opacity: 0.03, whiteSpace: 'nowrap', letterSpacing: 10,
            fontFamily: 'Arial, sans-serif', lineHeight: 1.8,
            transform: 'rotate(-15deg)',
            userSelect: 'none',
          }}>
            SHREE RAM ACADEMY &nbsp;&nbsp; SHREE RAM ACADEMY &nbsp;&nbsp; SHREE RAM ACADEMY
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${navy}, #2d5a8e)`,
          padding: '16px 32px',
          display: 'flex', alignItems: 'center',
          position: 'relative',
        }}>
          {/* Logo left */}
          <img src={logoSrc} alt="Shree Ram Academy"
            style={{ width: 60, height: 60, borderRadius: '50%', border: `2px solid ${gold}`, objectFit: 'cover', flexShrink: 0 }} />

          {/* Title center */}
          <div style={{ position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', letterSpacing: '0.15em', fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: 1 }}>
                SHREE RAM ACADEMY
              </div>
              <div style={{ fontSize: 9, letterSpacing: '0.08em', color: gold, fontFamily: 'Arial, sans-serif', fontWeight: 600, marginTop: 6 }}>
                SINCE 2016 · EXCELLENCE IN EDUCATION
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: '#ffffff', padding: '16px 52px' }}>

          {/* Certificate title */}
          <div style={{ textAlign: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: navy, letterSpacing: 6, fontFamily: 'Arial Black, Arial, sans-serif', textTransform: 'uppercase', lineHeight: 1 }}>
              CERTIFICATE
            </div>
          </div>

          {/* Gold line divider with OF EXCELLENCE */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '10px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: gold }} />
            <span style={{ fontSize: 9, letterSpacing: 4, color: gold, fontFamily: 'Arial,sans-serif', fontWeight: 700, textTransform: 'uppercase' }}>
              OF EXCELLENCE
            </span>
            <div style={{ flex: 1, height: 1, background: gold }} />
          </div>

          {/* Presented to */}
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <p style={{ fontSize: 9, color: '#888', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Arial,sans-serif', marginBottom: 10 }}>
              THIS CERTIFICATE IS AWARDED TO
            </p>
            <p style={{ fontSize: 28, fontWeight: 700, color: navy, margin: '0 0 2px', lineHeight: 1.2, fontFamily: 'Helvetica, Arial, sans-serif' }}>
              {student.name}
            </p>
            <div style={{ width: 200, height: 2, background: gold, margin: '8px auto 10px' }} />
          </div>

          {/* Body text */}
          <p style={{ textAlign: 'center', fontSize: 12, color: navy, lineHeight: 1.9, maxWidth: 520, margin: '0 auto 18px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
            This is to certify that <strong>{student.name}</strong> has successfully attained{' '}
            <strong>
              {form.marksObtained || '__'}/{form.totalMarks || '__'} Marks
              {percentage !== null ? ` (${percentage}%)` : ''}
              {autoGrade ? ` — Grade ${autoGrade}` : ''}
            </strong>{' '}
            and has been honoured with the <strong style={{ color: gold, fontSize: 14 }}>{form.rank} Rank</strong> in{' '}
            <strong>{form.examName}</strong>
            {form.subject ? <> — <strong>{form.subject}</strong></> : ''},{' '}
            Class <strong>{student.std}</strong>, in recognition of outstanding academic performance and unwavering dedication to excellence.
          </p>

          {/* Footer — clean lines, no dashed separator */}
          <div style={{ borderTop: `1.5px solid ${gold}`, opacity: 0.5, margin: '0 40px 18px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 10px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: navy, letterSpacing: 1, fontFamily: 'Arial', marginBottom: 6 }}>
                {form.month} {form.year}
              </div>
              <div style={{ width: 130, borderBottom: `2px solid ${navy}`, marginBottom: 4 }} />
              <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Date</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img src={logoSrc} alt="seal"
                style={{ width: 56, height: 56, borderRadius: '50%', opacity: 0.4, marginBottom: 4, objectFit: 'contain', background: '#ffffff' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <img src="/signature.png" alt="Signature"
                style={{ height: 48, maxWidth: 140, objectFit: 'contain', marginBottom: 2, display: 'block', margin: '0 auto 2px' }} />
              <div style={{ width: 140, borderBottom: `2px solid ${navy}`, margin: '0 auto 4px' }} />
              <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>
                Owner / Director
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── RoyalView ── */
function RoyalView({ student, form, percentage, autoGrade, logoSrc }) {
  const gold = '#C9A84C';
  const bg = '#2b2b2b';

  return (
    <div style={{
      width: '100%', maxWidth: 740, height: 450, margin: '0 auto',
      background: bg,
      border: `12px solid ${bg}`,
      outline: `4px solid ${gold}`,
      outlineOffset: '-20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Georgia, "Times New Roman", serif',
      boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
    }}>

      {/* Corner ornaments */}
      {[
        { top: 20, left: 20 },
        { top: 20, right: 20 },
        { bottom: 20, left: 20 },
        { bottom: 20, right: 20 },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          fontSize: 20,
          color: gold,
          zIndex: 3,
          lineHeight: 1,
          ...s,
        }}>◆</div>
      ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '16px 52px 20px' }}>

        {/* Top section — logo + academy name */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <img src={logoSrc} alt="Shree Ram Academy"
            style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid ${gold}`, objectFit: 'cover', display: 'block', margin: '0 auto 5px' }} />
          <div style={{ fontSize: 17, fontWeight: 700, color: gold, letterSpacing: '0.2em', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
            SHREE RAM ACADEMY
          </div>
          <div style={{ width: 200, height: 1, background: gold, margin: '5px auto' }} />
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: 'rgba(201,168,76,0.6)', fontFamily: 'Arial, sans-serif', fontWeight: 600 }}>
            SINCE 2016 · EXCELLENCE IN EDUCATION
          </div>
        </div>

        {/* Gold horizontal rule */}
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: '0 20px 8px' }} />

        {/* Certificate of Excellence */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: gold, letterSpacing: 6, fontFamily: 'Arial Black, Arial, sans-serif', textTransform: 'uppercase' }}>
            CERTIFICATE OF EXCELLENCE
          </div>
        </div>

        {/* Dash-dot pattern line */}
        <div style={{ textAlign: 'center', color: gold, fontSize: 10, letterSpacing: 4, margin: '3px 0 6px', opacity: 0.6 }}>
          · — · — · — · — · — · — · — ·
        </div>

        {/* Presented to */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Arial,sans-serif', marginBottom: 4 }}>
            Presented with Honour to
          </p>
          <p style={{ fontSize: 32, color: '#ffffff', fontStyle: 'italic', margin: '0 0 2px', lineHeight: 1.1, fontFamily: 'Georgia, serif' }}>
            {student.name}
          </p>
          {/* Gold gradient underline */}
          <div style={{ width: 220, height: 2, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: '5px auto 6px' }} />
        </div>

        {/* Body text */}
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto 10px', fontFamily: 'Georgia,serif' }}>
          This is to certify that <strong style={{ color: '#ffffff' }}>{student.name}</strong> has successfully attained{' '}
          <strong style={{ color: '#ffffff' }}>
            {form.marksObtained || '__'}/{form.totalMarks || '__'} Marks
            {percentage !== null ? ` (${percentage}%)` : ''}
            {autoGrade ? ` — Grade ${autoGrade}` : ''}
          </strong>{' '}
          and has been honoured with the <strong style={{ color: gold, fontSize: 14 }}>{form.rank} Rank</strong> in{' '}
          <strong style={{ color: '#ffffff' }}>{form.examName}</strong>
          {form.subject ? <> — <strong style={{ color: '#ffffff' }}>{form.subject}</strong></> : ''},{' '}
          Class <strong style={{ color: '#ffffff' }}>{student.std}</strong>, in recognition of outstanding academic performance and unwavering dedication to excellence.
        </p>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${gold}`, opacity: 0.3, margin: '0 40px 10px' }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#ffffff', letterSpacing: 1, fontFamily: 'Arial', marginBottom: 6 }}>
              {form.month} {form.year}
            </div>
            <div style={{ width: 130, borderBottom: `2px solid ${gold}`, marginBottom: 4 }} />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Date</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src={logoSrc} alt="seal"
              style={{ width: 56, height: 56, borderRadius: '50%', opacity: 0.3, marginBottom: 4, objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 6, padding: '4px 10px', display: 'inline-block', marginBottom: 2 }}>
              <img src="/signature.png" alt="Signature"
                style={{ height: 40, maxWidth: 120, objectFit: 'contain', display: 'block' }} />
            </div>
            <div style={{ width: 140, borderBottom: `2px solid ${gold}`, margin: '0 auto 4px' }} />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>
              Owner / Director
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── GeometricView ── */
function GeometricView({ student, form, percentage, autoGrade, logoSrc }) {
  const teal = '#2a9d8f';
  const gold = '#C9A84C';
  const dark = '#1a1a2e';

  return (
    <div style={{
      width: '100%', maxWidth: 740, height: 450, margin: '0 auto',
      background: '#ffffff',
      border: `2px solid ${gold}`,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Georgia, "Times New Roman", serif',
      boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
    }}>
      {/* 8px white space inner frame */}
      <div style={{ position: 'absolute', inset: 8, border: `2px solid ${gold}`, zIndex: 1, pointerEvents: 'none' }} />

      {/* Geometric SVG background */}
      <svg
        viewBox="0 0 740 500"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
        preserveAspectRatio="none"
      >
        {/* Top-left teal triangle */}
        <polygon points="0,0 220,0 0,180" fill="#2a9d8f" />
        {/* Inner lighter teal */}
        <polygon points="12,12 196,12 12,164" fill="#3ab5a6" />
        {/* Top-right gold triangle */}
        <polygon points="740,0 620,0 740,140" fill="#C9A84C" />
        {/* Inner gold-light */}
        <polygon points="728,12 636,12 728,124" fill="#e8c76a" />
        {/* Bottom-left gold triangle */}
        <polygon points="0,500 140,500 0,380" fill="#C9A84C" />
        {/* Bottom-right teal triangle */}
        <polygon points="740,500 560,500 740,340" fill="#2a9d8f" />
      </svg>

      {/* Best Award badge top-right */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 4 }}>
        <svg width="64" height="85" viewBox="0 0 80 106" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="geoTailG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f5e070"/>
              <stop offset="50%" stopColor="#C9A84C"/>
              <stop offset="100%" stopColor="#7a5c0a"/>
            </linearGradient>
            <linearGradient id="geoRingG" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#fff0a0"/>
              <stop offset="25%" stopColor="#C9A84C"/>
              <stop offset="60%" stopColor="#f0d060"/>
              <stop offset="100%" stopColor="#7a5c0a"/>
            </linearGradient>
            <radialGradient id="geoNavyG" cx="40%" cy="33%" r="68%">
              <stop offset="0%" stopColor="#2535b0"/>
              <stop offset="60%" stopColor="#0f1560"/>
              <stop offset="100%" stopColor="#060920"/>
            </radialGradient>
            <filter id="geoBsh" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/>
            </filter>
          </defs>
          <polygon points="40,67 25,67 16,104 25,97 32,104" fill="url(#geoTailG)"/>
          <line x1="32.5" y1="67" x2="24" y2="100" stroke="#a07820" strokeWidth="0.7" opacity="0.5"/>
          <polygon points="40,67 55,67 64,104 55,97 48,104" fill="url(#geoTailG)"/>
          <line x1="47.5" y1="67" x2="56" y2="100" stroke="#a07820" strokeWidth="0.7" opacity="0.5"/>
          {(() => {
            const cx=40, cy=37, oR=35, iR=29, pts=20;
            let d='';
            for(let i=0;i<pts*2;i++){
              const r=i%2===0?oR:iR;
              const a=(i*Math.PI/pts)-Math.PI/2;
              d+=(i===0?'M':'L')+`${(cx+r*Math.cos(a)).toFixed(2)},${(cy+r*Math.sin(a)).toFixed(2)}`;
            }
            return <path d={d+'Z'} fill="url(#geoRingG)" filter="url(#geoBsh)"/>;
          })()}
          <circle cx="40" cy="37" r="28" fill="none" stroke="#f0d060" strokeWidth="1.2"/>
          <circle cx="40" cy="37" r="27" fill="url(#geoNavyG)"/>
          <circle cx="40" cy="37" r="24.5" fill="none" stroke="#C9A84C" strokeWidth="1"/>
          <text x="40" y="32" textAnchor="middle" fill="#f0d060"
            fontSize="12" fontStyle="italic" fontWeight="700"
            fontFamily="Georgia,'Times New Roman',serif">Best</text>
          <text x="40" y="42" textAnchor="middle" fill="#ffffff"
            fontSize="8.5" fontWeight="900" letterSpacing="1.5"
            fontFamily="Arial Black,Arial,sans-serif">AWARD</text>
          <text x="40" y="51" textAnchor="middle" fill="#C9A84C"
            fontSize="7" fontFamily="Arial,sans-serif" letterSpacing="1">★ ★ ★</text>
        </svg>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '16px 60px 18px' }}>

        {/* Academy name */}
        <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 900, color: teal, letterSpacing: '0.18em', fontFamily: 'Georgia, serif', marginBottom: 4 }}>
          SHREE RAM ACADEMY
        </div>
        <div style={{ textAlign: 'center', fontSize: 9, color: '#888', letterSpacing: '0.22em', fontFamily: 'Arial, sans-serif', marginBottom: 6 }}>
          SINCE 2016  ·  EXCELLENCE IN EDUCATION
        </div>

        {/* CERTIFICATE big */}
        <div style={{ textAlign: 'center', fontSize: 42, fontWeight: 900, color: teal, fontFamily: 'Arial Black, Arial, sans-serif', lineHeight: 1, marginBottom: 6 }}>
          CERTIFICATE
        </div>

        {/* Gold underline */}
        <div style={{ width: 200, height: 2, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: '0 auto 10px' }} />

        {/* Presented to label */}
        <div style={{ textAlign: 'center', fontSize: 9, color: '#888', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif', marginBottom: 8 }}>
          THIS CERTIFICATE IS PROUDLY PRESENTED TO:
        </div>

        {/* Student name */}
        <div style={{ textAlign: 'center', fontSize: 32, color: dark, fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.2, marginBottom: 4 }}>
          {student.name}
        </div>

        {/* Subject/Exam label in gold */}
        <div style={{ textAlign: 'center', fontSize: 11, color: gold, textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'Arial, sans-serif', fontWeight: 700, marginBottom: 10 }}>
          {form.examName}{form.subject ? ` — ${form.subject}` : ''}
        </div>

        {/* Body paragraph */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#555', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 16px', fontFamily: 'Georgia, serif' }}>
          This is to certify that <strong style={{ color: dark }}>{student.name}</strong> has successfully attained{' '}
          <strong style={{ color: dark }}>
            {form.marksObtained || '__'}/{form.totalMarks || '__'} Marks
            {percentage !== null ? ` (${percentage}%)` : ''}
            {autoGrade ? ` — Grade ${autoGrade}` : ''}
          </strong>{' '}
          and has been honoured with the <strong style={{ color: gold }}>{form.rank} Rank</strong> in{' '}
          <strong style={{ color: dark }}>{form.examName}</strong>
          {form.subject ? <> — <strong style={{ color: dark }}>{form.subject}</strong></> : ''},{' '}
          Class <strong style={{ color: dark }}>{student.std}</strong>, in recognition of outstanding academic performance and unwavering dedication to excellence.
        </p>

        {/* Divider */}
        <div style={{ borderTop: `1.5px dashed ${gold}`, opacity: 0.4, margin: '0 40px 16px' }} />

        {/* Footer — 2 signature columns + centered logo seal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 10px', position: 'relative' }}>
          {/* Left: Date */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#555', letterSpacing: 1, fontFamily: 'Arial', marginBottom: 6 }}>
              {form.month} {form.year}
            </div>
            <div style={{ width: 130, borderBottom: `2px solid ${dark}`, marginBottom: 4 }} />
            <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Date</div>
          </div>

          {/* Center: Logo seal */}
          <div style={{ textAlign: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 0 }}>
            <img src={logoSrc} alt="seal"
              style={{ width: 50, height: 50, borderRadius: '50%', opacity: 0.35, objectFit: 'contain' }} />
          </div>

          {/* Right: Signature */}
          <div style={{ textAlign: 'center' }}>
            <img src="/signature.png" alt="Signature"
              style={{ height: 48, maxWidth: 140, objectFit: 'contain', display: 'block', margin: '0 auto 2px' }} />
            <div style={{ width: 140, borderBottom: `2px solid ${dark}`, margin: '0 auto 4px' }} />
            <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>
              Owner / Director
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── PrestigeView ── */
function PrestigeView({ student, form, percentage, autoGrade, logoSrc }) {
  const navy = '#1a2a6c';
  const gold = '#C9A84C';

  return (
    <div style={{
      width: '100%', maxWidth: 740, height: 450, margin: '0 auto',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f0f4ff 100%)',
      border: `6px solid ${navy}`,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Georgia, "Times New Roman", serif',
      boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
    }}>
      {/* Inner gold line at 10px inset */}
      <div style={{ position: 'absolute', inset: 10, border: `2px solid ${gold}`, zIndex: 1, pointerEvents: 'none' }} />

      {/* Decorative SVG background */}
      <svg
        viewBox="0 0 740 500"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
        preserveAspectRatio="none"
      >
        {/* Left navy sweep */}
        <path d="M0,0 C80,60 60,200 90,250 C60,300 80,440 0,500 Z" fill="#1a2a6c"/>
        {/* Left gold accent line */}
        <path d="M0,20 C60,80 40,200 70,250 C40,300 60,440 0,480 Z" fill="none" stroke="#C9A84C" strokeWidth="2" opacity="0.6"/>
        {/* Right navy sweep */}
        <path d="M740,0 C660,60 680,200 650,250 C680,300 660,440 740,500 Z" fill="#1a2a6c"/>
        {/* Right gold accent line */}
        <path d="M740,20 C680,80 700,200 670,250 C700,300 680,440 740,480 Z" fill="none" stroke="#C9A84C" strokeWidth="2" opacity="0.6"/>
        {/* Bottom-right gold ribbon 1 */}
        <path d="M740,320 C700,350 660,400 620,460 C660,470 700,490 740,500 Z" fill="#C9A84C" opacity="0.9"/>
        {/* Bottom-right gold ribbon 2 */}
        <path d="M740,280 C680,320 640,380 580,440 C620,450 660,470 700,490 C720,495 740,498 740,500 Z" fill="#C9A84C" opacity="0.5"/>
        {/* Top-right swirl accent */}
        <path d="M580,0 C620,20 680,10 740,30 L740,0 Z" fill="#C9A84C" opacity="0.4"/>
      </svg>

      {/* Best Award badge top-right */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 4 }}>
        <svg width="80" height="106" viewBox="0 0 80 106" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="presTailG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f5e070"/>
              <stop offset="50%" stopColor="#C9A84C"/>
              <stop offset="100%" stopColor="#7a5c0a"/>
            </linearGradient>
            <linearGradient id="presRingG" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#fff0a0"/>
              <stop offset="25%" stopColor="#C9A84C"/>
              <stop offset="60%" stopColor="#f0d060"/>
              <stop offset="100%" stopColor="#7a5c0a"/>
            </linearGradient>
            <radialGradient id="presNavyG" cx="40%" cy="33%" r="68%">
              <stop offset="0%" stopColor="#2535b0"/>
              <stop offset="60%" stopColor="#0f1560"/>
              <stop offset="100%" stopColor="#060920"/>
            </radialGradient>
            <filter id="presBsh" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/>
            </filter>
          </defs>
          <polygon points="40,67 25,67 16,104 25,97 32,104" fill="url(#presTailG)"/>
          <line x1="32.5" y1="67" x2="24" y2="100" stroke="#a07820" strokeWidth="0.7" opacity="0.5"/>
          <polygon points="40,67 55,67 64,104 55,97 48,104" fill="url(#presTailG)"/>
          <line x1="47.5" y1="67" x2="56" y2="100" stroke="#a07820" strokeWidth="0.7" opacity="0.5"/>
          {(() => {
            const cx=40, cy=37, oR=35, iR=29, pts=20;
            let d='';
            for(let i=0;i<pts*2;i++){
              const r=i%2===0?oR:iR;
              const a=(i*Math.PI/pts)-Math.PI/2;
              d+=(i===0?'M':'L')+`${(cx+r*Math.cos(a)).toFixed(2)},${(cy+r*Math.sin(a)).toFixed(2)}`;
            }
            return <path d={d+'Z'} fill="url(#presRingG)" filter="url(#presBsh)"/>;
          })()}
          <circle cx="40" cy="37" r="28" fill="none" stroke="#f0d060" strokeWidth="1.2"/>
          <circle cx="40" cy="37" r="27" fill="url(#presNavyG)"/>
          <circle cx="40" cy="37" r="24.5" fill="none" stroke="#C9A84C" strokeWidth="1"/>
          <text x="40" y="32" textAnchor="middle" fill="#f0d060"
            fontSize="12" fontStyle="italic" fontWeight="700"
            fontFamily="Georgia,'Times New Roman',serif">Best</text>
          <text x="40" y="42" textAnchor="middle" fill="#ffffff"
            fontSize="8.5" fontWeight="900" letterSpacing="1.5"
            fontFamily="Arial Black,Arial,sans-serif">AWARD</text>
          <text x="40" y="51" textAnchor="middle" fill="#C9A84C"
            fontSize="7" fontFamily="Arial,sans-serif" letterSpacing="1">★ ★ ★</text>
        </svg>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '18px 80px 10px' }}>

        {/* Academy name */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: navy, letterSpacing: '0.18em', fontFamily: 'Georgia, serif' }}>SHREE RAM ACADEMY</div>
          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${gold},transparent)`, margin: '3px auto', width: '60%' }} />
          <div style={{ fontSize: 8, color: '#888', letterSpacing: '0.22em', fontFamily: 'Arial, sans-serif' }}>SINCE 2016  ·  EXCELLENCE IN EDUCATION</div>
        </div>

        {/* CERTIFICATE title */}
        <div style={{ textAlign: 'center', fontSize: 34, fontWeight: 900, color: navy, letterSpacing: '4px', fontFamily: 'Arial Black, Arial, sans-serif', lineHeight: 1, marginBottom: 3 }}>
          CERTIFICATE
        </div>

        {/* OF GRADUATION subtitle */}
        <div style={{ textAlign: 'center', fontSize: 13, color: gold, letterSpacing: '4px', fontFamily: 'Arial, sans-serif', fontWeight: 700, marginBottom: 6 }}>
          OF GRADUATION
        </div>

        {/* Navy banner */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <div style={{ display: 'inline-block', background: navy, padding: '3px 20px' }}>
            <span style={{ fontSize: 8, color: '#ffffff', letterSpacing: '2px', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}>
              THIS CERTIFICATE IS PROUDLY PRESENTED TO
            </span>
          </div>
        </div>

        {/* Student name */}
        <div style={{ textAlign: 'center', fontSize: 34, color: gold, fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", serif', lineHeight: 1.1, marginBottom: 3 }}>
          {student.name}
        </div>

        {/* Subject/Exam in navy caps */}
        <div style={{ textAlign: 'center', fontSize: 10, color: navy, textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'Arial, sans-serif', fontWeight: 700, marginBottom: 6 }}>
          {form.examName}{form.subject ? ` — ${form.subject}` : ''}
        </div>

        {/* Body text */}
        <p style={{ textAlign: 'center', fontSize: 10.5, color: '#333', lineHeight: 1.65, maxWidth: 480, margin: '0 auto 8px', fontFamily: 'Georgia, serif' }}>
          This is to certify that <strong style={{ color: navy }}>{student.name}</strong> has successfully attained{' '}
          <strong style={{ color: navy }}>
            {form.marksObtained || '__'}/{form.totalMarks || '__'} Marks
            {percentage !== null ? ` (${percentage}%)` : ''}
            {autoGrade ? ` — Grade ${autoGrade}` : ''}
          </strong>{' '}
          and has been honoured with the <strong style={{ color: gold, fontSize: 12 }}>{form.rank} Rank</strong> in{' '}
          <strong style={{ color: navy }}>{form.examName}</strong>
          {form.subject ? <> — <strong style={{ color: navy }}>{form.subject}</strong></> : ''},{' '}
          Class <strong style={{ color: navy }}>{student.std}</strong>, in recognition of outstanding academic performance and unwavering dedication to excellence.
        </p>

        {/* Horizontal rule */}
        <div style={{ borderTop: `1px solid ${navy}`, opacity: 0.4, margin: '0 40px 8px' }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 10px', position: 'relative' }}>
          {/* Left: Date */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: navy, letterSpacing: 1, fontFamily: 'Arial', marginBottom: 4 }}>
              {form.month} {form.year}
            </div>
            <div style={{ width: 130, borderBottom: `2px solid ${navy}`, marginBottom: 3 }} />
            <div style={{ fontSize: 9, color: '#666', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Date</div>
          </div>

          {/* Center: Logo */}
          <div style={{ textAlign: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 0 }}>
            <img src={logoSrc} alt="seal"
              style={{ width: 54, height: 54, borderRadius: '50%', opacity: 0.4, objectFit: 'contain' }} />
          </div>

          {/* Right: Signature */}
          <div style={{ textAlign: 'center' }}>
            <img src="/signature.png" alt="Signature"
              style={{ height: 42, maxWidth: 130, objectFit: 'contain', display: 'block', margin: '0 auto 2px' }} />
            <div style={{ width: 130, borderBottom: `2px solid ${navy}`, margin: '0 auto 3px' }} />
            <div style={{ fontSize: 9, color: '#666', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>
              Owner / Director
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CertificateModal({ open, onClose, student }) {
  const certRef    = useRef(null);
  const wrapperRef = useRef(null);
  const now        = new Date();
  const logoSrc    = '/logo.jpg';
  const CERT_W  = 740;
  const CERT_H  = 500;
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale(Math.min(1, w / CERT_W));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [open]);

  const [form, setForm] = useState({
    examName:      'Half Yearly Exam',
    subject:       '',
    marksObtained: '',
    totalMarks:    '100',
    rank:          '1st',
    month:         MONTHS[now.getMonth()],
    year:          String(now.getFullYear()),
    template:      'Template 1',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const percentage = form.marksObtained && form.totalMarks
    ? Math.round((Number(form.marksObtained) / Number(form.totalMarks)) * 100)
    : null;

  const autoGrade = percentage === null ? '' :
    percentage >= 91 ? 'O'  :
    percentage >= 81 ? 'A+' :
    percentage >= 71 ? 'A'  :
    percentage >= 61 ? 'B+' :
    percentage >= 51 ? 'B'  :
    percentage >= 41 ? 'C'  :
    percentage >= 33 ? 'D'  : 'F';

  const handleDownload = async () => {
    const el = certRef.current;
    if (!el) return;
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Certificate_${student?.name?.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  const [waStatus, setWaStatus] = useState('');

  const handleWhatsAppShare = async () => {
    const el = certRef.current;
    if (!el) return;
    setWaStatus('generating');
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fdf8ee' });
      const fileName = `Certificate_${student?.name?.replace(/\s+/g, '_')}.png`;

      canvas.toBlob(async (blob) => {
        const file = new File([blob], fileName, { type: 'image/png' });

        // Mobile: Web Share API — directly opens WhatsApp share sheet
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          setWaStatus('');
          await navigator.share({ files: [file], title: `Certificate - ${student.name}` });
          return;
        }

        // Desktop fallback: copy image to clipboard, open WhatsApp Web
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setWaStatus('copied');
          window.open('https://web.whatsapp.com', '_blank');
          setTimeout(() => setWaStatus(''), 5000);
        } catch {
          setWaStatus('unsupported');
          setTimeout(() => setWaStatus(''), 4000);
        }
      }, 'image/png');
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
      setWaStatus('');
    }
  };

  if (!student) return null;

  const CertView = form.template === 'Template 2' ? ModernView
    : form.template === 'Template 3' ? RoyalView
    : form.template === 'Template 4' ? GeometricView
    : form.template === 'Template 5' ? PrestigeView
    : ClassicView;

  return (
    <AppModal open={open} onClose={onClose} title="Generate Certificate"
      subtitle={`${student.name} — Class ${student.std}`} width={Math.min(860, window.innerWidth - 16)} destroyOnClose>
      <div className="px-5 py-4 flex flex-col gap-5">

        {/* Form */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Exam Name',      type: 'select', key: 'examName',      options: EXAMS },
            { label: 'Subject',        type: 'text',   key: 'subject',       placeholder: 'e.g. Mathematics' },
            { label: 'Marks Obtained', type: 'number', key: 'marksObtained', placeholder: 'e.g. 85' },
            { label: 'Total Marks',    type: 'number', key: 'totalMarks' },
            { label: 'Template',       type: 'select', key: 'template',      options: ['Template 1', 'Template 2', 'Template 3', 'Template 4', 'Template 5'] },
            { label: 'Rank',           type: 'select', key: 'rank',          options: RANKS },
            { label: 'Month',          type: 'select', key: 'month',         options: MONTHS },
            { label: 'Year',           type: 'text',   key: 'year' },
          ].map(({ label, type, key, options, placeholder }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
              {type === 'select' ? (
                <select value={form[key]} onChange={(e) => set(key, e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ border: '1.5px solid #C9A84C', background: '#fffdf5' }}>
                  {options.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={type} value={form[key]} placeholder={placeholder}
                  onChange={(e) => set(key, e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ border: '1.5px solid #C9A84C', background: '#fffdf5' }} />
              )}
            </div>
          ))}
        </div>

        {/* Preview — scrollable frame */}
        <div ref={wrapperRef} style={{ width: '100%', overflowX: 'auto', overflowY: 'auto', maxHeight: 520, WebkitOverflowScrolling: 'touch', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <div ref={certRef} style={{ minWidth: CERT_W }}>
            <CertView student={student} form={form} percentage={percentage} autoGrade={autoGrade} logoSrc={logoSrc} />
          </div>
        </div>

      </div>

      {waStatus === 'copied' && (
        <div className="mx-5 mb-2 px-3 py-2 rounded-lg text-xs text-center font-semibold"
          style={{ background: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7' }}>
          Image clipboard mein copy ho gayi! WhatsApp Web mein <strong>Ctrl+V</strong> se paste karein.
        </div>
      )}
      {waStatus === 'unsupported' && (
        <div className="mx-5 mb-2 px-3 py-2 rounded-lg text-xs text-center font-semibold"
          style={{ background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }}>
          Is browser mein direct share supported nahi hai. PDF download karein.
        </div>
      )}
      <div className="px-5 pb-5 flex gap-3">
        <button onClick={handleWhatsAppShare} disabled={waStatus === 'generating'}
          className="flex-1 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', color: '#fff', opacity: waStatus === 'generating' ? 0.7 : 1 }}>
          <WhatsAppIcon /> {waStatus === 'generating' ? 'Please wait...' : 'WhatsApp'}
        </button>
        <button onClick={handleDownload}
          className="flex-1 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#1a1a1a,#2a2a2a)', color: '#C9A84C', border: '1.5px solid #C9A84C' }}>
          <DownloadOutlined /> Download PDF
        </button>
      </div>
    </AppModal>
  );
}
