import React, { useRef } from "react";
import { useRoute, Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { TRIPS, MediaItem } from "../data/trips";

function MediaBlock({ item, index }: { item: MediaItem, index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isEven = index % 2 === 0;

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -50 : 50, y: 20 }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      className={`flex flex-col ${isEven ? 'md:items-start' : 'md:items-end'} mb-24 w-full`}
    >
      <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 md:gap-12 items-center w-full max-w-5xl mx-auto`}>
        
        {/* Media Container */}
        <div className={`relative w-full ${item.orientation === 'portrait' ? 'md:w-1/3' : 'md:w-2/3'} border-4 border-black shadow-md bg-white p-2 md:p-4 rotate-1`}>
          <div className="absolute -top-4 left-1/2 w-16 h-8 bg-[#ddd] opacity-80 rotate-3 z-10 mix-blend-multiply" /> {/* Tape */}
          
          <div className="border-2 border-black overflow-hidden relative group">
            {item.type === 'video' ? (
              <div className="relative aspect-video bg-black">
                <video src={item.src} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" controls preload="metadata" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:hidden">
                  <div className="w-16 h-16 bg-primary border-4 border-black rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-black ml-2" />
                  </div>
                </div>
              </div>
            ) : (
              <img src={item.src} alt={item.caption} className={`w-full ${item.orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[16/9]'} object-cover grayscale-[10%] group-hover:grayscale-0 transition-all`} />
            )}
          </div>
        </div>

        {/* Caption */}
        <div className={`w-full md:w-1/3 mt-4 md:mt-0 flex flex-col ${isEven ? 'items-start text-left' : 'items-end text-right'}`}>
          <div className="inline-block bg-black text-white font-bold px-3 py-1 mb-3 text-sm uppercase">
            {item.timestamp}
          </div>
          <p className="text-2xl md:text-4xl font-black uppercase leading-tight bg-white border-4 border-black p-4 shadow-sm inline-block -rotate-1">
            {item.caption}
          </p>
        </div>

      </div>
    </motion.div>
  );
}

export default function TripStory() {
  const [, params] = useRoute("/trip/:id");
  const trip = TRIPS.find(t => t.id === params?.id);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="border-4 border-black p-8 bg-destructive text-white font-black text-4xl shadow-md uppercase">
          Trip Not Found
        </div>
        <Link href="/" className="ml-8 border-4 border-black px-6 py-3 font-bold bg-white text-black shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
          GO BACK
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full pb-32 overflow-x-hidden">
      
      {/* Navigation */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/" className="inline-block border-4 border-black px-4 py-2 font-bold bg-primary text-black shadow-sm hover:shadow-md hover:-translate-y-1 transition-all uppercase">
          ← Back to trips
        </Link>
      </div>

      {/* Hero */}
      <header className="min-h-[70vh] flex flex-col items-center justify-center relative border-b-8 border-black p-6" style={{ backgroundColor: trip.color }}>
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="text-center relative z-10"
        >
          <h1 className="text-7xl md:text-9xl font-black text-white uppercase drop-shadow-[6px_6px_0_rgba(0,0,0,1)] stroke-black" style={{ WebkitTextStroke: '3px black' }}>
            {trip.place}
          </h1>
          <div className="mt-8 transform rotate-2">
            <span className="bg-black text-white px-6 py-3 text-2xl md:text-4xl font-bold uppercase border-4 border-black inline-block shadow-sm">
              {trip.tagline}
            </span>
          </div>
        </motion.div>
      </header>

      {/* Timeline */}
      <main className="max-w-7xl mx-auto px-6 mt-32 relative">
        {/* Vertical Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-black -ml-1 hidden md:block opacity-20 border-x border-dashed border-white" />
        
        {trip.media.length > 0 ? (
          trip.media.map((item, index) => (
            <MediaBlock key={item.id} item={item} index={index} />
          ))
        ) : (
          <div className="text-center border-4 border-black border-dashed p-20 bg-muted">
            <h2 className="text-4xl font-black uppercase text-muted-foreground">More memories coming soon...</h2>
          </div>
        )}
      </main>
      
    </div>
  );
}
