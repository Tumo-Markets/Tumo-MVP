import ChartComponent from 'src/components/Chart/ChartComponent';
import PageTransition from 'src/components/PageTransition';
import LongShort from 'src/views/markets/LongShort';

export default function MarketDetailPage() {
  return (
    <PageTransition direction="forward">
      <div className="flex flex-col md:flex-row gap-4 h-full overflow-hidden">
        <div className="w-full md:flex-7 min-w-0">
          <ChartComponent isDisplay={false} />
        </div>

        <div className="w-full md:flex-3 md:min-w-[300px] md:max-w-[400px] flex flex-col overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-hide">
          <LongShort isDisplay={false} />
        </div>
      </div>
    </PageTransition>
  );
}
