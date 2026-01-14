import { useState } from 'react';

interface TabsProps {
  tabs: string[];
  defaultTab?: number;
  onTabChange?: (index: number) => void;
}

export default function CustomTab({ tabs, defaultTab = 0, onTabChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    onTabChange?.(index);
  };

  return (
    <div className="bg-[#0c0c0c] relative rounded-lg h-12 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex items-center p-1 relative size-full">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={`basis-0 grow h-full min-h-px min-w-px relative rounded-md shrink-0 ${
                activeTab === index ? 'bg-[#2b2b2b]' : ''
              }`}
            >
              <div className="flex flex-row items-center justify-center size-full">
                <div className="box-border content-stretch flex gap-2.5 items-center justify-center px-2.5 py-1 relative size-full font-normal">
                  <p
                    className={`leading-5 relative shrink-0 text-md ${
                      activeTab === index ? 'text-white' : 'text-[rgba(255,255,255,0.65)]'
                    } text-nowrap text-right whitespace-pre`}
                  >
                    {tab}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
