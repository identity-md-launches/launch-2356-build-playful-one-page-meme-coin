export type IconName = 'arrow' | 'arrowUp' | 'bolt' | 'check' | 'close' | 'copy' | 'download' | 'menu' | 'play' | 'warning' | 'x' | 'telegram';

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M4 12h15M13 5l7 7-7 7" /></>,
    arrowUp: <><path d="M6 18 18 6M5 6h13v13" /></>,
    bolt: <path d="m14 2-9 12h7l-2 8 9-12h-7z" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M15 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    play: <path d="m9 5 11 7-11 7z" />,
    warning: <><path d="m12 3 10 18H2zM12 9v5M12 17v.1" /></>,
    x: <><path d="m4 3 16 18h-4L1 3zM20 3 4 21" /></>,
    telegram: <><path d="m22 3-4 18-7-6-4 4 1-7L22 3 2 10l6 2M8 12l10-6-7 9" /></>,
  };
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function RobotMark() {
  return <svg className="robot-mark" viewBox="0 0 44 44" fill="none" aria-hidden="true"><rect x="5" y="15" width="34" height="25" rx="6" fill="currentColor" /><rect x="10" y="21" width="24" height="12" rx="3" fill="var(--color-bg)" /><path d="m14 24 6 3-6 2m16-5-6 3 6 2" fill="currentColor" /><path d="M6 16C6 1 38 1 38 16M3 16h38" fill="var(--color-safety)" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><path d="M22 4v9" stroke="currentColor" strokeWidth="2.5" /></svg>;
}
