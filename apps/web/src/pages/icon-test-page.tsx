import { Icon } from '@meet/schemas/icon';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { usePageTitle } from '../components/app-shell';

import type { ChangeEvent, CSSProperties, MouseEvent } from 'react';

const iconSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const selectedSizeClassName =
  'rounded-full bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white';

const idleSizeClassName =
  'rounded-full px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:text-stone-900';

type IconPresetSize = (typeof iconSizes)[number];

type IconProbeMetrics = {
  attributeSize: string;
  className: string;
  hasSizeUtility: boolean;
  renderedSize: string;
};

type IconProbeProps = {
  customSize?: number;
  probeId: string;
  size: IconPresetSize;
  title: string;
};

type CustomSizeState = {
  error: string;
  value?: number;
};

function isIconPresetSize(value: string): value is IconPresetSize {
  return iconSizes.some((size) => size === value);
}

function readCustomSize(input: string): CustomSizeState {
  const trimmed = input.trim();

  if (trimmed === '') {
    return { error: '' };
  }

  const value = Number(trimmed);

  if (!Number.isFinite(value)) {
    return { error: 'Enter a number in pixels.' };
  }

  return { error: '', value };
}

function IconProbe({ customSize, probeId, size, title }: IconProbeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<IconProbeMetrics>({
    attributeSize: '',
    className: '',
    hasSizeUtility: false,
    renderedSize: '',
  });

  // Measure after layout so the readout matches the painted SVG, including
  // Tailwind size utilities that override the width and height attributes.
  useLayoutEffect(() => {
    const svg = rootRef.current?.querySelector('svg');

    if (!svg) {
      return;
    }

    const { height, width } = svg.getBoundingClientRect();
    const className = svg.getAttribute('class') ?? '';
    const nextMetrics: IconProbeMetrics = {
      attributeSize: `${svg.getAttribute('width') ?? ''}×${svg.getAttribute('height') ?? ''}`,
      className,
      hasSizeUtility: /\bsize-/.test(className),
      renderedSize: `${Math.round(width)}×${Math.round(height)} px`,
    };

    setMetrics((current) =>
      current.attributeSize === nextMetrics.attributeSize &&
      current.className === nextMetrics.className &&
      current.renderedSize === nextMetrics.renderedSize
        ? current
        : nextMetrics,
    );
  }, [customSize, size]);

  const sizeUtilityLabel = metrics.hasSizeUtility
    ? 'Tailwind size class is applied'
    : 'No Tailwind size class';

  return (
    <article
      className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
      data-probe={probeId}
    >
      <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
      <div ref={rootRef} className="flex min-h-16 items-center">
        <Icon
          name="Check"
          size={size}
          color="primary"
          customSize={customSize}
        />
      </div>
      <dl className="flex flex-col gap-1 text-sm text-stone-600">
        <div>
          <dt className="inline">Rendered </dt>
          <dd className="inline font-medium text-stone-900" data-rendered-size>
            {metrics.renderedSize}
          </dd>
        </div>
        <div>
          <dt className="inline">SVG attribute </dt>
          <dd className="inline font-medium text-stone-900">
            {metrics.attributeSize}
          </dd>
        </div>
      </dl>
      <p className="text-sm text-stone-700" data-size-utility>
        {sizeUtilityLabel}
      </p>
      <p className="break-all font-mono text-xs text-stone-500">
        {metrics.className}
      </p>
    </article>
  );
}

export function IconTestPage() {
  const [selectedSize, setSelectedSize] = useState<IconPresetSize>('sm');
  const [customSizeInput, setCustomSizeInput] = useState('40');

  usePageTitle('Icon');

  const customSizeState = useMemo(
    () => readCustomSize(customSizeInput),
    [customSizeInput],
  );

  const sizeOptions = useMemo(
    () =>
      iconSizes.map((size) => ({
        className:
          size === selectedSize ? selectedSizeClassName : idleSizeClassName,
        size,
      })),
    [selectedSize],
  );

  const reference = useMemo(() => {
    if (customSizeState.value === undefined) {
      return undefined;
    }

    const style: CSSProperties = {
      height: customSizeState.value,
      width: customSizeState.value,
    };

    return {
      label: `${customSizeState.value}px reference`,
      style,
    };
  }, [customSizeState.value]);

  const handleCustomSizeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCustomSizeInput(event.target.value);
    },
    [],
  );

  const handleSelectSize = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const { size } = event.currentTarget.dataset;

      if (size && isIconPresetSize(size)) {
        setSelectedSize(size);
      }
    },
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-stone-900">Size variant</p>
          <div className="flex flex-wrap gap-1 rounded-full bg-stone-100 p-1">
            {sizeOptions.map((option) => (
              <button
                key={option.size}
                type="button"
                className={option.className}
                data-size={option.size}
                aria-pressed={option.size === selectedSize}
                onClick={handleSelectSize}
              >
                {option.size}
              </button>
            ))}
          </div>
        </div>
        <label className="flex max-w-xs flex-col gap-2 text-sm font-medium text-stone-900">
          customSize, px
          <input
            className="rounded-xl border border-stone-200 px-3 py-2 font-normal text-stone-900 outline-none ring-teal-700 focus:ring-2"
            inputMode="decimal"
            value={customSizeInput}
            onChange={handleCustomSizeChange}
          />
        </label>
        <p className="min-h-5 text-sm text-red-700">{customSizeState.error}</p>
        <div className="flex items-end gap-3">
          <div className="shrink-0 bg-teal-100" style={reference?.style} />
          <p className="text-sm text-stone-500">
            {reference?.label ??
              'Reference box is hidden until customSize is a number.'}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <IconProbe
          probeId="variant"
          title={`Variant ${selectedSize}`}
          size={selectedSize}
        />
        <IconProbe
          probeId="custom"
          title={`Variant ${selectedSize} + customSize`}
          size={selectedSize}
          customSize={customSizeState.value}
        />
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Preset sizes</h2>
        <ul className="flex flex-wrap items-end gap-5">
          {iconSizes.map((size) => (
            <li key={size} className="flex flex-col items-center gap-2">
              <Icon name="Check" size={size} color="primary" />
              <span className="text-xs text-stone-500">{size}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
