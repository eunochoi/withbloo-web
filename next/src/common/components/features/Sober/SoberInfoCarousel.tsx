'use client';

import { useRef, useState, type ReactNode } from 'react';

export default function SoberInfoCarousel({ pages, color }: { pages: [ReactNode, ReactNode]; color: string }) {
  const scroll = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  return <div className="-mb-3 flex flex-col gap-1">
    <div ref={scroll} onScroll={(event) => { const element = event.currentTarget; if (element.clientWidth) setPage(Math.max(0, Math.min(1, Math.round(element.scrollLeft / element.clientWidth)))); }} className="grid auto-cols-[100%] grid-flow-col snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {pages.map((content, index) => <div key={index} ref={(element) => { if (element) element.inert = page !== index; }} aria-hidden={page !== index} className="flex min-w-0 snap-start items-center justify-center">{content}</div>)}
    </div>
    <div className="flex justify-center">{['현재 진행중인 시간', '기록 요약'].map((label, index) => <button key={label} type="button" aria-label={label} aria-pressed={page === index} onClick={() => { setPage(index); scroll.current?.scrollTo({ left: index * scroll.current.clientWidth, behavior: 'smooth' }); }} className="flex h-8 w-8 items-center justify-center"><span className={`h-2 w-2 rounded-full ${page === index ? 'opacity-100' : 'opacity-25'}`} style={{ backgroundColor: color }} /></button>)}</div>
  </div>;
}
