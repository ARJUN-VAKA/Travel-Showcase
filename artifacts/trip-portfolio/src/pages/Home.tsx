import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { TRIPS } from "../data/trips";

export default function Home() {
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-background w-full pb-20">
      <header className="border-b-4 border-black bg-primary px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden">
        <motion.div 
          initial={{ rotate: -5, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="absolute -top-10 -left-10 w-40 h-40 bg-secondary rounded-full border-4 border-black"
        />
        <motion.div 
          initial={{ rotate: 10, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent rounded-sm border-4 border-black"
        />
        <h1 className="text-6xl md:text-8xl font-black text-black tracking-tighter relative z-10 uppercase drop-shadow-[4px_4px_0_rgba(255,255,255,1)]">
          WE WENT PLACES
        </h1>
        <p className="mt-6 text-xl md:text-2xl font-bold bg-black text-white px-4 py-2 uppercase border-2 border-black inline-block relative z-10 shadow-[4px_4px_0_0_rgba(255,45,85,1)]">
          The ultimate friends trip scrapbook
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-16">
        <motion.div 
          variants={containerVars} 
          initial="hidden" 
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {TRIPS.map((trip) => (
            <motion.div key={trip.id} variants={itemVars}>
              <Link href={`/trip/${trip.id}`} className="block group">
                <div className="bg-card border-4 border-black shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl relative overflow-visible h-full flex flex-col">
                  
                  {/* Image container */}
                  <div className="relative aspect-[4/3] w-full border-b-4 border-black overflow-hidden bg-muted">
                    <img 
                      src={trip.coverImage} 
                      alt={trip.place} 
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                    />
                    
                    {/* Badge */}
                    <div 
                      className="absolute top-4 left-4 border-4 border-black px-4 py-2 shadow-sm font-black text-2xl uppercase tracking-wider text-black transform -rotate-2 group-hover:rotate-0 transition-transform"
                      style={{ backgroundColor: trip.color }}
                    >
                      {trip.place}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold uppercase line-clamp-1">{trip.tagline}</h3>
                    <div className="mt-4 flex items-center justify-between text-sm font-bold border-t-2 border-dashed border-black pt-4">
                      <span className="bg-black text-white px-2 py-1 uppercase">{trip.date}</span>
                      <span className="border-2 border-black px-2 py-1 bg-white">{trip.friendCount} FRIENDS</span>
                    </div>
                  </div>
                  
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
