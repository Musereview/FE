import MetronomeDots from '@/components/metronome/MetronomeDots';

interface HistoryPlayerBarProps {
  isPlaying: boolean;
  isScoreLoading: boolean;
  beatsPerBar: number;
  beatInBar: number;
  onTogglePlay: () => void;
  onRewindClick: () => void;
}

export default function HistoryPlayerBar({
  isPlaying,
  isScoreLoading,
  beatsPerBar,
  beatInBar,
  onTogglePlay,
  onRewindClick,
}: HistoryPlayerBarProps) {
  return (
    <div className="mt-[24px] flex items-center justify-between">
      <div className="flex h-[52px] items-center gap-[16px]">
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={isScoreLoading}
          className="flex aspect-square h-[52px] w-[52px] cursor-pointer items-center justify-center bg-transparent transition-all outline-none hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30">
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" fill="none">
              <rect x="15" y="11" width="7" height="30" rx="2" className="fill-primary-400" />
              <rect x="30" y="11" width="7" height="30" rx="2" className="fill-primary-400" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" fill="none">
              <path
                d="M40.4208 25.384C41.1931 25.88 41.1931 27.12 40.4208 27.6159L16.7377 42.8254C15.9654 43.3214 15 42.7014 15 41.7095L15 11.2905C15 10.2986 15.9654 9.67858 16.7377 10.1746L40.4208 25.384Z"
                className="fill-primary-400"
              />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={onRewindClick}
          disabled={isScoreLoading}
          className="flex aspect-square h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-[6px] bg-gray-800 transition-all outline-none hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30">
          <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect width="52" height="52" rx="6" className="fill-gray-800" />
            <path
              d="M31.199 9.86647C31.6985 9.63189 32.2939 9.8468 32.5291 10.346L34.8865 15.3548C35.2162 16.0554 34.9152 16.8912 34.2147 17.221L29.2059 19.5784C28.7061 19.8135 28.11 19.5986 27.8748 19.0989C27.6399 18.5992 27.8547 18.0039 28.3543 17.7688L31.4559 16.3089C29.3421 15.3169 26.9815 14.9465 24.6522 15.2532C21.9784 15.6053 19.4947 16.8296 17.5877 18.7366C15.6811 20.6435 14.4563 23.1266 14.1043 25.8001C13.7524 28.4737 14.2931 31.1892 15.6414 33.5247C16.9898 35.86 19.0709 37.686 21.5623 38.718C24.0537 39.75 26.8169 39.9314 29.4217 39.2337C32.0265 38.5357 34.3288 36.997 35.9705 34.8577C37.6121 32.7183 38.5026 30.0963 38.5027 27.3997C38.5027 26.8475 38.9506 26.3998 39.5027 26.3997C40.0549 26.3998 40.5027 26.8475 40.5027 27.3997C40.5026 30.5366 39.4671 33.5868 37.5574 36.0755C35.6477 38.564 32.9693 40.3534 29.9393 41.1653C26.9092 41.977 23.6958 41.7661 20.7977 40.5657C17.8994 39.3652 15.4776 37.2415 13.909 34.5247C12.3406 31.808 11.7126 28.6494 12.1219 25.5393C12.5313 22.4293 13.9557 19.5408 16.1736 17.3225C18.3919 15.1043 21.2812 13.6793 24.3914 13.2698C27.0854 12.9152 29.8154 13.3397 32.2635 14.4788L30.7195 11.1975C30.4847 10.6979 30.6994 10.1016 31.199 9.86647Z"
              className="fill-gray-400"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center">
        <MetronomeDots total={beatsPerBar} current={isPlaying ? beatInBar : -1} />
      </div>
    </div>
  );
}
