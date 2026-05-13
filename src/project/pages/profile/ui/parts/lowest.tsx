import { useState } from 'react';

const TABS = ['Posts', 'Reels', 'Tags'] as const;
type Tab = typeof TABS[number];

const LowestSection = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Posts');

  const renderContent = () => {
    switch (activeTab) {
      case 'Posts':
        return <div className="p-4 h-[900px] bg-red-900">📸 Posts content goes here</div>;
      case 'Reels':
        return <div className="p-4">🎥 Reels content goes here</div>;
      case 'Tags':
        return <div className="p-4">🏷️ Tags content goes here</div>;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex border-b border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-3 text-sm ${
              activeTab === tab ? 'text-white border-b-2 border-white' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default LowestSection;
