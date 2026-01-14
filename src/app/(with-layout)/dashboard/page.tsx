'use client';

import PageTransition from 'src/components/PageTransition';
import { ExternalLink } from 'lucide-react';
import { useMarketsValue } from 'src/states/markets';
import { formatNumber } from 'src/utils/format';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { createdMarkets } = useMarketsValue();
  const router = useRouter();

  function onClickOpenMarket(marketId: string) {
    router.push(`/dashboard/${marketId}`);
  }

  return (
    <PageTransition direction="forward">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Created Markets</h1>

          {createdMarkets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-[#958794]/30 rounded-lg bg-secondary/10">
              <p className="text-muted-foreground text-lg mb-4">No markets created yet</p>
              <a
                href="/launch"
                className="px-6 py-3 rounded-lg bg-linear-to-r from-[#1c54ff] to-[#001a61] hover:from-[#163fbf] hover:to-[#001244] text-white font-semibold transition-all"
              >
                Create Your First Market
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdMarkets.map(market => (
                <div
                  key={market.id}
                  className="border border-[#958794] rounded-lg bg-background p-6 hover:border-[#958794]/70 transition-colors hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center text-lg font-bold text-foreground">
                      {market.tokenSymbol ? market.tokenSymbol.slice(0, 3).toUpperCase() : '—'}
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-foreground mb-0">{market.tokenSymbol}</h2>
                      <p className="text-sm text-tertiary-foreground">{market.tokenName}</p>
                    </div>

                    <div className="ml-auto">
                      <button
                        onClick={() => onClickOpenMarket(market.id)}
                        className="text-tertiary-foreground hover:text-foreground transition-colors"
                        aria-label="open-market"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-tertiary-foreground mb-1">Volume</p>
                      <p className="text-blue-400 font-semibold">${formatNumber(market.volume)}</p>
                    </div>
                    <div>
                      <p className="text-tertiary-foreground mb-1">Trades</p>
                      <p className="text-foreground font-semibold">{formatNumber(market.trades)}</p>
                    </div>
                    <div>
                      <p className="text-tertiary-foreground mb-1">Created</p>
                      <p className="text-foreground font-semibold">{market.createdAt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
