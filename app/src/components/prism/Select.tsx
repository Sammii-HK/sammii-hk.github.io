'use client';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { useCombobox } from './behaviour';
import { useReducedMotion } from './reduced-motion';
import { SPRINGS, springTransition } from './spring-css';

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  label: string;
  disabled?: boolean;
};

/** Prism Reserved Select, with portfolio surface tokens and a bounded popup. */
export function Select({ value, onChange, options, label, disabled }: SelectProps) {
  const labelId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const { open, close, active, selected, buttonProps, listProps, optionProps } = useCombobox({ value, onChange, options, disabled });
  const reduced = useReducedMotion();
  const transition = reduced ? 'none' : springTransition(['opacity', 'transform', 'visibility'], SPRINGS.settle);

  useEffect(() => {
    const list = listRef.current;
    const option = list?.children[active] as HTMLElement | undefined;
    if (!open || !list || !option) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [open, active]);

  return (
    <div className="prism-select" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) close();
    }}>
      <span id={labelId} className="prism-select-label">{label}</span>
      <button {...buttonProps} onKeyUp={event => { if (event.key === ' ') event.preventDefault(); }} aria-labelledby={labelId} className="prism-select-trigger">
        <span>{options[selected]?.label}</span>
        <ChevronDown size={16} aria-hidden="true" style={{ transition, transform: `rotate(${open ? 180 : 0}deg)` }} />
      </button>
      <ul {...listProps} ref={listRef} aria-labelledby={labelId} aria-hidden={!open}
        className="prism-select-options"
        style={{ transition, opacity: open ? 1 : 0, transform: `translateY(${open ? 0 : -4}px)`, visibility: open ? 'visible' : 'hidden' }}>
        {options.map((option, index) => (
          <li key={option.value} {...optionProps(index)} className="prism-select-option" data-active={index === active ? '' : undefined}>
            <span>{option.label}</span>
            {index === selected && <Check size={15} aria-hidden="true" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
