import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'lightOutline';
type Size = 'md' | 'lg';

const base =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full text-sm font-medium transition-[background-color,color,border-color,transform,box-shadow] duration-300 ease-calm disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-[1px]';

const variants: Record<Variant, string> = {
  primary: 'bg-ink-800 text-ivory hover:bg-primary-700 shadow-soft',
  secondary: 'border border-ink/15 bg-white/70 text-ink-700 hover:border-primary/40 hover:bg-white',
  ghost: 'text-ink-600 hover:text-primary',
  light: 'bg-ivory text-ink-800 hover:bg-white shadow-soft',
  lightOutline: 'border border-ivory/30 text-ivory hover:border-ivory/60 hover:bg-ivory/10',
};

const sizes: Record<Size, string> = {
  md: 'px-5 py-2.5',
  lg: 'px-7 py-3.5 text-[0.95rem]',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsLink = CommonProps & { href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, 'href' | 'className' | 'children'>;
type ButtonAsButton = CommonProps & { href?: undefined } & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = 'primary', size = 'md', className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, type, ...rest } = props;
  return (
    <button type={type ?? 'button'} className={classes} {...rest}>
      {children}
    </button>
  );
}
