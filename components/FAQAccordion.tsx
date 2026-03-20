'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  heading?: string;
}

function PlusMinusIcon({ open }: { open: boolean }) {
  return (
    <div className="relative w-5 h-5 shrink-0">
      {/* Horizontal line (always present) */}
      <span className="absolute top-1/2 left-0 w-5 h-0.5 bg-zinc-400 -translate-y-1/2 transition-colors group-hover:bg-white" />
      {/* Vertical line (rotates to disappear when open) */}
      <motion.span
        className="absolute top-0 left-1/2 w-0.5 h-5 bg-zinc-400 -translate-x-1/2 group-hover:bg-white"
        animate={{ rotate: open ? 90 : 0, opacity: open ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
}

export function FAQAccordion({ items, heading = 'Frequently Asked Questions' }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="w-full max-w-3xl mx-auto">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {heading && (
        <h2 className="text-3xl font-bold text-white text-center mb-10">
          {heading}
        </h2>
      )}

      <div className="flex flex-col divide-y divide-zinc-800">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="group">
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="flex items-center justify-between w-full py-5 text-left cursor-pointer gap-4"
              >
                <span className="text-zinc-100 font-medium text-lg group-hover:text-white transition-colors">
                  {item.question}
                </span>
                <PlusMinusIcon open={isOpen} />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-zinc-400 leading-relaxed pr-10">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
