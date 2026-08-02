import React from 'react';
import type { WeeklySummary } from '@/types/history';

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  diff: number | null;
  unit: string;
}

// 1. 이번주 요약 카드 공통 컴포넌트
function SummaryCard({ icon, title, value, diff, unit }: SummaryCardProps) {
  return (
    <div className="box-border flex h-[160px] flex-1 flex-col items-start justify-between rounded-[6px] border border-gray-800 bg-gray-900 p-[24px]">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-[12px]">
          {icon}
          <span className="text-[22px] leading-[32px] font-medium tracking-[-0.44px] text-gray-300">{title}</span>
        </div>
        <span className="text-primary-300 text-[32px] leading-[44px] font-semibold tracking-[-0.64px]">{value}</span>
      </div>
      <div className="text-[15px] font-normal text-gray-600">
        {diff !== null && (
          <>
            전 주보다{' '}
            <span className="text-primary-300">
              {Math.abs(diff)}
              {unit} {diff >= 0 ? '증가' : '감소'}
            </span>
            했어요
          </>
        )}
      </div>
    </div>
  );
}

interface HistorySummaryCardsProps {
  data?: WeeklySummary;
}

// 2. 메인 컴포넌트
export default function HistorySummaryCards({ data }: HistorySummaryCardsProps) {
  const cards = [
    {
      title: '정확도',
      value: data ? `${data.accuracy}%` : '-',
      diff: data?.accuracyDiff ?? null,
      unit: '%',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="aspect-square">
          <path
            d="M3.5 2.25C3.91421 2.25 4.25 2.58579 4.25 3V18C4.25 18.1381 4.36193 18.25 4.5 18.25H19.5C19.9142 18.25 20.25 18.5858 20.25 19C20.25 19.4142 19.9142 19.75 19.5 19.75H4.5C3.5335 19.75 2.75 18.9665 2.75 18V3C2.75 2.58579 3.08579 2.25 3.5 2.25ZM18.9199 6.52441C19.1827 6.20445 19.6555 6.15747 19.9756 6.41992C20.2955 6.68266 20.3425 7.15548 20.0801 7.47559L16.9014 11.3467C16.2497 12.1402 15.0578 12.2048 14.3242 11.4863L12.0947 9.30273C11.9923 9.20282 11.827 9.20896 11.7324 9.31641L8.06348 13.4951C7.79015 13.8062 7.31607 13.8367 7.00488 13.5635C6.69381 13.2901 6.66327 12.8161 6.93652 12.5049L10.6055 8.32715C11.2678 7.57284 12.4273 7.52908 13.1445 8.23145L15.374 10.415C15.4788 10.5174 15.6492 10.5078 15.7422 10.3945L18.9199 6.52441Z"
            fill="#CECFD1"
          />
        </svg>
      ),
    },
    {
      title: '연습 시간',
      value: data ? `${data.practiceMinutes}분` : '-',
      diff: data?.practiceMinutesDiff ?? null,
      unit: '분',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="aspect-square">
          <path
            d="M12 2.5C17.2467 2.5 21.5 6.75329 21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM11.5 8C11.7759 8.00026 11.9999 8.22407 12 8.5V13.002H14.5049C14.7806 13.0022 15.0046 13.2262 15.0049 13.502C15.0049 13.7779 14.7808 14.0017 14.5049 14.002H11.7998C11.3581 14.0018 11 13.6439 11 13.2021V8.5C11.0001 8.22391 11.2239 8 11.5 8Z"
            fill="#CECFD1"
          />
        </svg>
      ),
    },
    {
      title: '완료 세션',
      value: data ? `${data.completedSessionCount}개` : '-',
      diff: data?.completedSessionCountDiff ?? null,
      unit: '개',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="aspect-square">
          <path
            d="M6 12.1613L9.80181 16.733C9.91883 16.8738 10.1335 16.8778 10.2557 16.7416L19 7"
            stroke="#CECFD1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex w-[1196px] gap-[16px]">
      {cards.map((card) => (
        <SummaryCard key={card.title} {...card} />
      ))}
    </div>
  );
}
