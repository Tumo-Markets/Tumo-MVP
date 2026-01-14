const svgPaths = {
  p16ef8100:
    'M17.2091 10.4692L7.18698 1.85545C5.79211 0.656586 4.03356 0 2.21748 0H0V44H5.02817H12.2396C16.5255 44 20 40.4183 20 36V16.6138C20 14.2402 18.9776 11.9892 17.2091 10.4692Z',
  p2f9422e0: 'M13.3333 2.66667L2.66667 13.3333M2.66667 13.3333H10.2857M2.66667 13.3333V5.71429',
  p3ee77c80: 'M0 8V36C0 40.4183 3.18375 44 7.11111 44H20V0H7.11111C3.18375 0 0 3.58172 0 8Z',
};

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  fillColor?: string;
  strokeColor?: string;
  height?: number;
}

function Frame({ fillColor = '#F45049', height = 40 }: { fillColor: string; height: number }) {
  return (
    <div
      className="absolute content-stretch flex h-10 items-center left-0 right-[-0.5px] top-0"
      style={{ height: `${height}px` }}
    >
      <div className="h-full relative shrink-0 w-5" data-name="Left">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 44">
          <path d={svgPaths.p3ee77c80} fill={fillColor} id="Left" />
        </svg>
      </div>
      <div
        className="basis-0 grow h-10 min-h-px min-w-px shrink-0"
        style={{ backgroundColor: `${fillColor}`, height: `${height}px` }}
      />
      <div className="h-full relative shrink-0 w-5" data-name="Right">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 44">
          <path d={svgPaths.p16ef8100} fill={fillColor} id="Right" />
        </svg>
      </div>
    </div>
  );
}

function TextBound({
  children,
  textColor,
  disabled,
}: {
  children: React.ReactNode;
  textColor?: string;
  disabled?: boolean;
}) {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0" data-name="Text bound">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-2 items-center justify-center px-1 py-[19px] relative size-full">
          <div
            className="flex items-center justify-center gap-2 leading-0 not-italic relative shrink-0 text-[14px] text-center text-nowrap tracking-[0.1px]"
            style={{ color: textColor || '#ff504f', opacity: disabled ? 0.5 : 1 }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoundedCornerButton({
  children = 'Short',
  onClick,
  className = '',
  disabled = false,
  fillColor = '#F45049',
  strokeColor = '#FF504F',
  height = 40,
}: ButtonProps) {
  return (
    <button
      className={`content-stretch flex items-center justify-center relative size-full ${className} ${
        disabled ? 'cursor-not-allowed' : ''
      }`}
      data-name="Button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <Frame fillColor={fillColor} height={height} />
      <TextBound textColor={strokeColor} disabled={disabled}>
        {children}
      </TextBound>
    </button>
  );
}
