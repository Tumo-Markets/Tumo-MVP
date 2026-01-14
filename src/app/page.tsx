'use client';

import PageTransition from 'src/components/PageTransition';

export default function Home() {
  return (
    <PageTransition direction="forward">
      <div className="flex flex-col h-full relative">
        <main className="flex min-h-full w-full flex-col items-center px-4 bg-white dark:bg-black">
          <div className="flex w-full justify-between gap-6">
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">Tumo</p>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
