// components/Gallery.jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Image from 'next/image';

export default function Gallery({ images }) {
  return (
    <Swiper
      spaceBetween={10}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      className="my-4"
    >
      {images.map((src, idx) => (
        <SwiperSlide key={idx}>
          <div className="relative w-full h-64 md:h-96">
            <Image src={src} alt={`Studio image ${idx + 1}`} fill className="object-cover" />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
