import type { KeyboardEvent, ReactNode } from 'react';

interface ClickableCardProps {
  onClick?: () => void;
  className: string;
  children: ReactNode;
}

function ClickableCard({ onClick, className, children }: ClickableCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={`${className} ${onClick ? 'cursor-pointer' : ''}`}>
      {children}
    </div>
  );
}

export default ClickableCard;
