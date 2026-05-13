const CommunityBar = () => {
  return (
    <div
      className="
        fixed top-0 bottom-0 right-0
        hidden homecommunitybarscreen:block
        w-[35%] homeleftbarscreen:w-[30%]
        bg-dark_tertiary text-white
        border-l border-gray-200 p-2 h-screen
      "
    >
      <div className="p-3 h-[52%] bg-indigo-500 m-3 rounded-lg border border-indigo-100 animate-float">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Community</h2>
        <div className="font-semibold text-indigo-700">Designers Group</div>
        <div className="text-sm text-gray-600 mt-1">1.2k members</div>
        <div className="text-xs text-gray-500 mt-2">Latest discussion: UI Trends 2023</div>
      </div>
      <div className="p-3 bg-amber-500 h-[45%] m-3 rounded-lg border border-amber-100 animate-float">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Chat</h2>
        <div className="font-semibold text-amber-700">Developers Hub</div>
        <div className="text-sm text-gray-600 mt-1">850 members</div>
        <div className="text-xs text-gray-500 mt-2">Latest discussion: React vs Vue</div>
      </div>
    </div>
  );
};

export default CommunityBar;