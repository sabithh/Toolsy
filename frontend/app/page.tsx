'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Zap, CreditCard, UserCheck, SearchCheck, Package } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      {/* Animated Red Background */}
      <div className="fixed inset-0 z-0 bg-[#DC2626]">
        {/* Grid Pattern in Black */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px),
                             linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        ></div>

        {/* Subtle noise or darkening for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#b91c1c]/20 to-black/10"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="container-custom">
          <div className="max-w-7xl mx-auto text-center">

            {/* Massive Typography - Black on Red */}
            <ScrollReveal>
              <h1 className="text-8xl md:text-9xl font-black mb-12 leading-[0.8] tracking-tighter uppercase">
                <span className="block text-black">Rent</span>
                <span className="block text-white">Build</span>
                <span className="block text-black">Create</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-xl md:text-2xl text-black/80 mb-16 max-w-2xl mx-auto uppercase tracking-widest font-bold">
                Professional tools. Local shops.<br />
                <span className="text-white">No ownership required.</span>
              </p>
            </ScrollReveal>

            {/* CTA Buttons */}
            <ScrollReveal delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-8 justify-center mb-24">
                <Link href="/tools" className="group relative px-12 py-6 bg-black text-white font-black text-xl uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-300">
                  <span className="relative z-10 flex items-center gap-3">
                    Start Renting <SearchCheck size={24} />
                  </span>
                  <div className="absolute inset-0 border-2 border-black translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
                </Link>
                <Link href="/register" className="group relative px-12 py-6 border-2 border-black text-black font-black text-xl uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-300">
                  <span className="relative z-10 flex items-center gap-3">
                    List Tools <UserCheck size={24} />
                  </span>
                </Link>
              </div>
            </ScrollReveal>

            {/* Stats - Black text on Red */}
            <ScrollReveal delay={0.6}>
              <div className="grid grid-cols-1 md:grid-cols-3 border-t border-b border-black/10 divide-y md:divide-y-0 md:divide-x divide-black/10">
                <div className="py-12 px-6 group hover:bg-black/5 transition-colors">
                  <div className="text-6xl font-black text-black mb-2 group-hover:text-white transition-colors">500+</div>
                  <div className="text-sm text-black/60 uppercase tracking-[0.2em] font-bold">Tools Ready</div>
                </div>
                <div className="py-12 px-6 group hover:bg-black/5 transition-colors">
                  <div className="text-6xl font-black text-black mb-2 group-hover:text-white transition-colors">100+</div>
                  <div className="text-sm text-black/60 uppercase tracking-[0.2em] font-bold">Local Pro Shops</div>
                </div>
                <div className="py-12 px-6 group hover:bg-black/5 transition-colors">
                  <div className="text-6xl font-black text-black mb-2 group-hover:text-white transition-colors">24/7</div>
                  <div className="text-sm text-black/60 uppercase tracking-[0.2em] font-bold">Instant Booking</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <div className="text-[10px] uppercase tracking-[0.3em] text-black">Scroll</div>
          <div className="w-[1px] h-12 bg-gradient-to-b from-black to-transparent"></div>
        </div>
      </section>

      {/* Features Section - Black Contrast Section */}
      <section className="relative z-10 py-32 border-t border-black/20 bg-black text-white">
        <div className="container-custom">
          {/* Section Header */}
          <ScrollReveal>
            <div className="mb-20 border-l-4 border-[#DC2626] pl-8">
              <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                Why <span className="text-[#DC2626]">Toolsy?</span>
              </h2>
              <p className="text-xl text-gray-500 uppercase tracking-widest">
                Engineered for builders
              </p>
            </div>
          </ScrollReveal>

          {/* Feature Cards - Black on Black with Red borders/accents */}
          <div className="grid md:grid-cols-3 gap-1">
            {/* Feature 1 */}
            <ScrollReveal delay={0.1}>
              <div className="group relative p-12 bg-[#111] border border-white/10 hover:border-[#DC2626] transition-colors duration-300 h-full">
                <div className="mb-8">
                  <MapPin size={48} className="text-[#DC2626]" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-4">GPS Search</h3>
                <p className="text-gray-500 leading-relaxed font-mono text-sm">
                  Location-powered search finds tools within minutes of you. Real-time availability updates.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature 2 */}
            <ScrollReveal delay={0.2}>
              <div className="group relative p-12 bg-[#111] border border-white/10 hover:border-[#DC2626] transition-colors duration-300 h-full">
                <div className="mb-8">
                  <Zap size={48} className="text-[#DC2626]" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-4">Instant Book</h3>
                <p className="text-gray-500 leading-relaxed font-mono text-sm">
                  Reserve in seconds. Pick up when ready. Smart scheduling and inventory management.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature 3 */}
            <ScrollReveal delay={0.3}>
              <div className="group relative p-12 bg-[#111] border border-white/10 hover:border-[#DC2626] transition-colors duration-300 h-full">
                <div className="mb-8">
                  <CreditCard size={48} className="text-[#DC2626]" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-4">Flex Payment</h3>
                <p className="text-gray-500 leading-relaxed font-mono text-sm">
                  Pay online securely or cash on return. Your choice, maximum convenience.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Final CTA - Red again */}
      <section className="relative z-10 py-32 bg-[#DC2626]">
        <div className="container-custom">
          <ScrollReveal>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
              <div>
                <h2 className="text-6xl md:text-8xl font-black text-black uppercase tracking-tighter leading-none mb-6">
                  Ready to<br />Transform?
                </h2>
                <p className="text-2xl text-white font-bold uppercase tracking-widest">
                  Join the network today
                </p>
              </div>
              <Link href="/register" className="bg-black text-white px-16 py-8 font-black text-2xl uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-300 flex items-center gap-4">
                Get Started <UserCheck size={32} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
