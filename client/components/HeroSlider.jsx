"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';

const heroSlides = [
  {
    src: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=1600&q=80',
    title: 'Capture Perfect Moments',
    subtitle: 'Premium photography studios with professional lighting & cyc walls',
    label: 'Photo Studios',
    category: 'Photo Studios',
  },
  {
    src: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1600&q=80',
    title: 'Record Your Story',
    subtitle: 'State-of-the-art podcast rooms with acoustic treatment & broadcast gear',
    label: 'Podcast Rooms',
    category: 'Podcast Rooms',
  },
  {
    src: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=80',
    title: 'Produce Chart-Toppers',
    subtitle: 'World-class music suites and film sound stages for every project',
    label: 'Music Suites',
    category: 'Music Suites',
  },
];

export default function HeroSlider() {
  return (
    <section className="relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="h-[70vh] min-h-[420px]"
      >
        {heroSlides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="relative h-full w-full">
              <Image
                src={slide.src}
                alt={slide.title}
                fill
                className="object-cover"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col items-start justify-center px-8 md:px-20">
                <span className="badge badge-primary mb-4 text-sm font-semibold px-3 py-2">
                  {slide.label}
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white hero-text-shadow mb-3 max-w-2xl leading-tight">
                  {slide.title}
                </h1>
                <p className="text-gray-200 text-lg md:text-xl max-w-xl mb-6 opacity-90">
                  {slide.subtitle}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link
                    href={`/studios?category=${encodeURIComponent(slide.category)}`}
                    className="btn btn-primary btn-lg"
                  >
                    Explore {slide.label}
                  </Link>
                  <Link
                    href="/studios"
                    className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-black"
                  >
                    View All Studios
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
