import { ReactNode, useState } from "react";

const titleHeight = 32;

type PlaygroundTileProps = {
  title?: string;
  children?: ReactNode;
  className?: string;
  childrenClassName?: string;
  padding?: boolean;
  backgroundColor?: string;
  isActive?: boolean;
};

export type PlaygroundTab = {
  title: string;
  content: ReactNode;
};

export type PlaygroundTabbedTileProps = {
  tabs: PlaygroundTab[];
  initialTab?: number;
} & PlaygroundTileProps;

export const PlaygroundTile: React.FC<PlaygroundTileProps> = ({
  children,
  title,
  className,
  childrenClassName,
  padding = true,
  backgroundColor = "transparent",
  isActive = false,
}) => {
  const contentPadding = padding ? 4 : 0;
  return (
    <div className="relative group h-full">
      {/* Glowing border effect - Top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#BE185D] to-transparent opacity-80 blur-[1px] transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Glowing border effect - Right */}
      <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-[#BE185D] to-transparent opacity-80 blur-[1px] transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Glowing border effect - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#BE185D] to-transparent opacity-80 blur-[1px] transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Glowing border effect - Left */}
      <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#BE185D] to-transparent opacity-80 blur-[1px] transition-opacity duration-300 group-hover:opacity-100" />

      <div
        className={`relative flex flex-col h-full text-white bg-transparent ${className}`}
      >
        {title && (
          <div
            className="flex items-center justify-center text-xs uppercase py-2 border-b border-b-white/10 tracking-wider"
            style={{
              height: `${titleHeight}px`,
            }}
          >
            <h2 className="font-bold text-[#BE185D]">{title}</h2>
          </div>
        )}
        <div
          className={`flex flex-col items-center grow w-full bg-transparent ${childrenClassName}`}
          style={{
            height: `calc(100% - ${title ? titleHeight + "px" : "0px"})`,
            padding: `${contentPadding * 4}px`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export const PlaygroundTabbedTile: React.FC<PlaygroundTabbedTileProps> = ({
  tabs,
  initialTab = 0,
  className,
  childrenClassName,
  backgroundColor = "transparent",
}) => {
  const contentPadding = 4;
  const [activeTab, setActiveTab] = useState(initialTab);
  if(activeTab >= tabs.length) {
    return null;
  }
  return (
    <div className="relative group h-full">
      {/* Glowing border effect - Top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#BE185D] to-transparent opacity-80 blur-[1px] transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Glowing border effect - Right */}
      <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-[#BE185D] to-transparent opacity-80 blur-[1px] transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Glowing border effect - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#BE185D] to-transparent opacity-80 blur-[1px] transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Glowing border effect - Left */}
      <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#BE185D] to-transparent opacity-80 blur-[1px] transition-opacity duration-300 group-hover:opacity-100" />

      <div
        className={`relative flex flex-col h-full text-white bg-transparent ${className}`}
      >
        <div
          className="flex items-center justify-start text-xs uppercase border-b border-b-white/10 tracking-wider"
          style={{
            height: `${titleHeight}px`,
          }}
        >
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`px-4 py-2 hover:text-[#BE185D] border-r border-r-white/10 transition-colors duration-200 ${
                index === activeTab
                  ? `text-[#BE185D] font-bold`
                  : `text-white/90 hover:text-[#BE185D]`
              }`}
              onClick={() => setActiveTab(index)}
            >
              {tab.title}
            </button>
          ))}
        </div>
        <div
          className={`w-full h-full bg-transparent ${childrenClassName}`}
          style={{
            height: `calc(100% - ${titleHeight}px)`,
            padding: `${contentPadding * 4}px`,
          }}
        >
          {tabs[activeTab].content}
        </div>
      </div>
    </div>
  );
};
