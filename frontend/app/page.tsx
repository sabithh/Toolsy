'use client';

import Link from 'next/link';
import { MapPin, Zap, CreditCard, UserCheck, SearchCheck, ShoppingBag, Tag } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="container-custom">
          <div className="max-w-7xl mx-auto text-center">

            {/* Badge */}
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-10 text-xs font-bold uppercase tracking-[4px]"
                style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text-muted)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D20000', display: 'inline-block' }}></span>
                Rent Anything · Kerala
              </div>
            </ScrollReveal>

            {/* Headline */}
            <ScrollReveal delay={0.1}>
              <h1 className="font-black mb-10 leading-[0.85] tracking-tighter uppercase"
                style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(4.5rem, 14vw, 10rem)', color: 'var(--text-primary)' }}>
                <span className="block">Rent</span>
                <span className="block" style={{ color: '#D20000' }}>Anything</span>
                <span className="block">Near You</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-lg md:text-xl mb-14 max-w-xl mx-auto font-semibold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-barlow), sans-serif', letterSpacing: '3px' }}>
                Tools · Equipment · Gear<br />
                <span style={{ color: 'var(--text-primary)' }}>From trusted owners near you.</span>
              </p>
            </ScrollReveal>

            {/* CTA */}
            <ScrollReveal delay={0.35}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24">
                <Link href="/tools"
                  className="group flex items-center justify-center gap-3 px-10 py-5 font-black text-lg uppercase tracking-widest no-underline transition-all duration-200"
                  style={{ background: '#D20000', color: 'white', borderRadius: 8, fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.1em' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#B10000'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#D20000'}
                >
                  <SearchCheck size={22} /> Browse Items
                </Link>
                <Link href="/register"
                  className="group flex items-center justify-center gap-3 px-10 py-5 font-black text-lg uppercase tracking-widest no-underline transition-all duration-200"
                  style={{ background: 'transparent', color: 'var(--text-primary)', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.1em' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D20000'; (e.currentTarget as HTMLElement).style.color = '#D20000'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                >
                  <Tag size={22} /> List Your Items
                </Link>
              </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal delay={0.5}>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x"
                style={{ border: '1px solid var(--border)' }}>
                {[
                  { value: '500+', label: 'Items Available' },
                  { value: '100+', label: 'Verified Owners' },
                  { value: '24/7', label: 'Instant Booking' },
                ].map((stat) => (
                  <div key={stat.label} className="py-12 px-6 group"
                    style={{ borderRight: '1px solid var(--border)' }}>
                    <div className="text-5xl font-black mb-2 transition-colors"
                      style={{ fontFamily: 'var(--font-bebas), sans-serif', color: 'var(--text-primary)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#D20000'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                    >{stat.value}</div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container-custom">
          <ScrollReveal>
            <div className="mb-20" style={{ borderLeft: '3px solid #D20000', paddingLeft: '1.5rem' }}>
              <h2 className="font-black uppercase tracking-tighter leading-none mb-3"
                style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(3rem, 8vw, 6rem)', color: 'var(--text-primary)' }}>
                Why <span style={{ color: '#D20000' }}>Vaadaka?</span>
              </h2>
              <p className="text-sm uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-barlow), sans-serif', letterSpacing: '4px' }}>
                Rent anything · Earn from what you own
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
            {[
              { icon: MapPin, title: 'Near You', desc: 'Location-powered search finds items from owners within minutes of you. Real-time availability.' },
              { icon: Zap, title: 'Instant Book', desc: 'Reserve in seconds. Chat with the owner. Pick up when ready. Smart scheduling.' },
              { icon: CreditCard, title: 'No Upfront Cost', desc: 'No subscription. Owners pay only 2% commission per completed rental. Renters browse free.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <ScrollReveal key={title} delay={0.1 * (i + 1)}>
                <div className="p-10 group transition-colors duration-300 h-full"
                  style={{ background: 'var(--bg-surface)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#D20000'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'transparent'}>
                  <div className="mb-6">
                    <Icon size={40} style={{ color: '#D20000' }} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-wider mb-3"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.1em' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-32" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container-custom">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <h2 className="font-black uppercase tracking-tighter leading-none mb-3"
                style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'var(--text-primary)' }}>
                How It Works
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Renter */}
            <ScrollReveal delay={0.1}>
              <div className="p-8 h-full" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingBag size={28} style={{ color: '#D20000' }} />
                  <h3 className="text-xl font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif' }}>
                    I Want to Rent
                  </h3>
                </div>
                <ol className="space-y-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <li className="flex gap-3"><span style={{ color: '#D20000', fontWeight: 700, minWidth: 20 }}>01</span> Browse listings near you</li>
                  <li className="flex gap-3"><span style={{ color: '#D20000', fontWeight: 700, minWidth: 20 }}>02</span> Book the item online</li>
                  <li className="flex gap-3"><span style={{ color: '#D20000', fontWeight: 700, minWidth: 20 }}>03</span> Chat with owner to coordinate</li>
                  <li className="flex gap-3"><span style={{ color: '#D20000', fontWeight: 700, minWidth: 20 }}>04</span> Pick up, use, return</li>
                </ol>
                <Link href="/register"
                  className="mt-8 flex items-center justify-center gap-2 py-3 font-bold text-sm uppercase tracking-widest no-underline transition-all duration-200"
                  style={{ background: '#D20000', color: 'white', borderRadius: 6 }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#B10000'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#D20000'}
                >
                  Join as Renter
                </Link>
              </div>
            </ScrollReveal>

            {/* Owner */}
            <ScrollReveal delay={0.2}>
              <div className="p-8 h-full" style={{ background: 'var(--bg-surface)', border: '1px solid #D20000', borderRadius: 8 }}>
                <div className="flex items-center gap-3 mb-6">
                  <Tag size={28} style={{ color: '#D20000' }} />
                  <h3 className="text-xl font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif' }}>
                    I Want to List
                  </h3>
                </div>
                <ol className="space-y-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <li className="flex gap-3"><span style={{ color: '#D20000', fontWeight: 700, minWidth: 20 }}>01</span> Register as an owner</li>
                  <li className="flex gap-3"><span style={{ color: '#D20000', fontWeight: 700, minWidth: 20 }}>02</span> List your items with photos & price</li>
                  <li className="flex gap-3"><span style={{ color: '#D20000', fontWeight: 700, minWidth: 20 }}>03</span> Accept bookings, chat with renters</li>
                  <li className="flex gap-3"><span style={{ color: '#D20000', fontWeight: 700, minWidth: 20 }}>04</span> Earn — only 2% commission</li>
                </ol>
                <Link href="/register?role=provider"
                  className="mt-8 flex items-center justify-center gap-2 py-3 font-bold text-sm uppercase tracking-widest no-underline transition-all duration-200"
                  style={{ background: 'transparent', color: '#D20000', border: '1px solid #D20000', borderRadius: 6 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#D20000'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#D20000'; }}
                >
                  Join as Owner
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32" style={{ borderTop: '1px solid var(--border)', background: '#0D0D0D' }}>
        <div className="container-custom">
          <ScrollReveal>
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
              <div>
                <h2 className="font-black uppercase tracking-tighter leading-none mb-4"
                  style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(3rem, 8vw, 6rem)', color: 'var(--text-primary)' }}>
                  Ready to<br /><span style={{ color: '#D20000' }}>Vaadaka?</span>
                </h2>
                <p className="text-lg font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-barlow), sans-serif', letterSpacing: '3px' }}>
                  Join Kerala&apos;s rental network today
                </p>
              </div>
              <Link href="/register"
                className="flex items-center gap-3 px-14 py-6 font-black text-xl uppercase tracking-widest no-underline transition-all duration-200 whitespace-nowrap"
                style={{ background: '#D20000', color: 'white', borderRadius: 8, fontFamily: 'var(--font-bebas), sans-serif' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#B10000'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#D20000'}
              >
                Get Started <UserCheck size={28} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
