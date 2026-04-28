import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import Button from '../ui/Button';
import FloatingOrb from '../3d/FloatingOrb';
import DataParticles from '../3d/DataParticles';
import gsap from 'gsap';

export const HeroSection = () => {
  const nav = useNavigate();
  const [text, setText] = useState('');
  const fullText = "SALES INTELLIGENCE";
  const heroRef = useRef(null);

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
    }
  }, []);

  return (
    <section 
      ref={heroRef}
      className='relative mb-6 overflow-hidden rounded-2xl border border-white/5 shadow-2xl'
      style={{ minHeight: '400px' }}
    >
      {/* Backgrounds */}
      <img 
        src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1920&q=80" 
        alt="Dark Tech Background" 
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg z-0 pointer-events-none" />
      <div className="absolute inset-0 z-0">
        <DataParticles />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row h-full p-6 md:p-10">
        
        {/* Left Side */}
        <div className="w-full md:w-[60%] flex flex-col justify-center text-center md:text-left z-20">
          <h1 className='font-syne text-4xl font-extrabold sm:text-5xl lg:text-6xl text-white drop-shadow-lg min-h-[80px]'>
            <span className="gradient-text">{text}</span>
            <span className="animate-pulse">|</span>
          </h1>
          <p className='mt-4 max-w-xl text-sm sm:text-lg text-muted mx-auto md:mx-0'>
            Forecast smarter decisions with premium analytics, optimization, and AI-powered insights.
          </p>
          <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start'>
            <Button onClick={() => nav(ROUTES.predict)} className='h-12 w-full sm:w-auto px-8 text-base glow-primary transition-all hover:scale-105'>
              Start Predicting
            </Button>
            <Button variant='ghost' onClick={() => nav(ROUTES.modelInfo)} className='h-12 w-full sm:w-auto px-8 text-base border border-white/10 hover:bg-white/5 transition-all hover:scale-105'>
              View Model Info
            </Button>
          </div>
          
          {/* Mini Inline Stats */}
          <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-6 font-mono text-xs text-secondary/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success status-pulse"></span>
              99.9% Uptime
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              &lt;200ms Latency
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              1M+ Predictions
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden md:flex w-[40%] justify-center items-center relative z-10 mt-10 md:mt-0">
          <div className="absolute w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] animate-[morph_8s_ease-in-out_infinite]" style={{
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
          }}></div>
          <div className="w-[350px] h-[350px]">
            <FloatingOrb />
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;