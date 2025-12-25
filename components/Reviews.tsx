
import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { REVIEWS } from '../constants';

const Reviews: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const next = () => setActiveIdx((prev) => (prev + 1) % REVIEWS.length);
  const prev = () => setActiveIdx((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);

  return (
    <section id="reviews" className="py-16 md:py-24 bg-[#F5F0E8] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl font-rounded font-bold text-[#4A3728] text-center mb-12 md:mb-16">Отзывы наших клиенток</h2>
        
        <div className="max-w-4xl mx-auto relative px-2 md:px-12">
          {/* Controls - Better positioned for mobile touch */}
          <button 
            onClick={prev}
            className="absolute left-[-10px] md:left-0 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white rounded-full shadow-md text-[#8B6F5C] hover:bg-[#8B6F5C] hover:text-white transition-all z-10"
            aria-label="Previous review"
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <button 
            onClick={next}
            className="absolute right-[-10px] md:right-0 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white rounded-full shadow-md text-[#8B6F5C] hover:bg-[#8B6F5C] hover:text-white transition-all z-10"
            aria-label="Next review"
          >
            <ChevronRight size={20} className="md:w-6 md:h-6" />
          </button>

          <div className="bg-white p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-sm relative overflow-hidden">
            <Quote className="absolute top-4 left-4 md:top-8 md:left-8 text-[#E8C4B8] w-10 h-10 md:w-16 md:h-16 opacity-30" />
            
            <div className="relative z-10 space-y-6 md:space-y-8">
              <div className="flex justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={`md:w-5 md:h-5 ${i < REVIEWS[activeIdx].rating ? "fill-[#C49A7C] text-[#C49A7C]" : "text-gray-200"}`} 
                  />
                ))}
              </div>
              
              <p className="text-lg md:text-2xl text-[#4A3728] text-center italic font-light leading-relaxed px-2">
                "{REVIEWS[activeIdx].text}"
              </p>
              
              <div className="text-center pt-2 md:pt-4">
                <p className="text-lg md:text-xl font-bold text-[#4A3728]">{REVIEWS[activeIdx].author}</p>
                <p className="text-[#8B6F5C] text-xs md:text-sm mt-1">{REVIEWS[activeIdx].date}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 md:mt-10 space-x-2 md:space-x-3">
            {REVIEWS.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`h-2 md:h-3 rounded-full transition-all ${activeIdx === i ? 'bg-[#8B6F5C] w-6 md:w-8' : 'bg-[#E8C4B8] w-2 md:w-3'}`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
