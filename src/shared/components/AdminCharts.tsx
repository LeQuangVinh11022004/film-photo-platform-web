"use client";

import { useState } from "react";

type Point = { x: number; y: number };

function smoothPath(points: Point[]) {
	if (points.length < 2) return "";
	let path = `M ${points[0].x} ${points[0].y}`;
	for (let index = 0; index < points.length - 1; index += 1) {
		const before = points[index - 1] ?? points[index];
		const start = points[index];
		const end = points[index + 1];
		const after = points[index + 2] ?? end;
		path += ` C ${start.x + (end.x - before.x) / 6} ${start.y + (end.y - before.y) / 6}, ${end.x - (after.x - start.x) / 6} ${end.y - (after.y - start.y) / 6}, ${end.x} ${end.y}`;
	}
	return path;
}

export type AreaSeries = {
	key: string;
	label: string;
	values: number[];
	color: string;
	format: (value: number) => string;
	plot?: boolean;
	area?: boolean;
	dashed?: boolean;
};

const chartWidth = 700;
const chartHeight = 220;
const paddingX = 28;
const paddingTop = 18;
const paddingBottom = 14;

export function AreaTrendChart({ labels, series, animationKey, ariaLabel }: { labels: string[]; series: AreaSeries[]; animationKey: string; ariaLabel: string }) {
	const [active, setActive] = useState<number | null>(null);
	const plotted = series.filter((item) => item.plot !== false);
	const max = Math.max(...plotted.flatMap((item) => item.values)) * 1.08;
	const step = (chartWidth - paddingX * 2) / Math.max(1, labels.length - 1);
	const toPoints = (values: number[]) => values.map((value, index) => ({ x: paddingX + index * step, y: chartHeight - paddingBottom - (value / max) * (chartHeight - paddingTop - paddingBottom) }));
	const baseline = chartHeight - paddingBottom;

	return (
		<div className="mt-6">
			<div className="admin-chart-grid relative h-56 border-b border-[#e8e8e2]" onPointerLeave={() => setActive(null)}>
				<svg key={animationKey} role="img" aria-label={ariaLabel} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
					<defs>
						{plotted.map((item) => <linearGradient key={item.key} id={`area-${animationKey}-${item.key}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={item.color} stopOpacity="0.32" /><stop offset="100%" stopColor={item.color} stopOpacity="0" /></linearGradient>)}
					</defs>
					{plotted.map((item) => {
						const points = toPoints(item.values);
						const line = smoothPath(points);
						return <g key={item.key}>
							{item.area && <path d={`${line} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`} fill={`url(#area-${animationKey}-${item.key})`} className="admin-area-fill" />}
							<path d={line} pathLength={1000} fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={item.dashed ? "7 8" : undefined} vectorEffect="non-scaling-stroke" className={item.dashed ? "admin-area-fade" : "admin-area-line"} />
						</g>;
					})}
					{active !== null && <line x1={paddingX + active * step} x2={paddingX + active * step} y1={paddingTop} y2={baseline} stroke="#9a9b94" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />}
				</svg>
				{plotted.map((item) => toPoints(item.values).map((point, index) => <span key={`${item.key}-${index}`} aria-hidden="true" className="admin-area-dot pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" style={{ left: `${(point.x / chartWidth) * 100}%`, top: `${(point.y / chartHeight) * 100}%`, backgroundColor: item.color, animationDelay: `${600 + index * 70}ms`, transform: active === index ? "translate(-50%, -50%) scale(1.5)" : undefined }} />))}
				<div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}>
					{labels.map((label, index) => <button key={label} type="button" aria-label={`${label}: ${series.map((item) => `${item.label} ${item.format(item.values[index])}`).join(", ")}`} onPointerEnter={() => setActive(index)} onFocus={() => setActive(index)} onBlur={() => setActive(null)} className="h-full cursor-crosshair outline-none" />)}
				</div>
				{active !== null && <div role="presentation" className="pointer-events-none absolute z-10 min-w-36 rounded-md border border-[#deded8] bg-white px-3 py-2 text-xs shadow-lg" style={{ left: `${((paddingX + active * step) / chartWidth) * 100}%`, top: 4, transform: `translateX(${active > labels.length / 2 ? "-105%" : "5%"})` }}>
					<p className="font-semibold text-[#292b27]">{labels[active]}</p>
					{series.map((item) => <p key={item.key} className="mt-1 flex items-center justify-between gap-3 text-[#686a64]"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span><span className="font-semibold text-[#292b27]">{item.format(item.values[active])}</span></p>)}
				</div>}
			</div>
			<div className="mt-2 grid" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}>{labels.map((label) => <span key={label} className="truncate text-center text-[10px] text-[#82837d] sm:text-xs">{label}</span>)}</div>
		</div>
	);
}

export type RingItem = { label: string; percentage: number; color: string; detail: string };

export function RadialRings({ items, centerLabel, centerValue, animationKey }: { items: RingItem[]; centerLabel: string; centerValue: string; animationKey: string }) {
	const [active, setActive] = useState<string | null>(null);
	const activeItem = items.find((item) => item.label === active);

	return (
		<div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
			<div className="relative h-44 w-44 shrink-0">
				<svg key={animationKey} viewBox="0 0 180 180" role="group" aria-label={centerLabel} className="h-full w-full">
					{items.map((item, index) => {
						const radius = 78 - index * 16;
						const length = 2 * Math.PI * radius;
						return <g key={item.label}>
							<circle cx="90" cy="90" r={radius} fill="none" stroke="#eeeee9" strokeWidth="9" />
							<circle cx="90" cy="90" r={radius} fill="none" stroke={item.color} strokeWidth="9" strokeLinecap="round" strokeDasharray={length} strokeDashoffset={length * (1 - item.percentage / 100)} tabIndex={0} role="img" aria-label={`${item.label}: ${item.detail}, ${item.percentage}%`} className="admin-ring cursor-pointer outline-none" style={{ ["--ring-length" as string]: length, animationDelay: `${index * 140}ms`, opacity: active && active !== item.label ? 0.35 : 1 }} onPointerEnter={() => setActive(item.label)} onPointerLeave={() => setActive(null)} onFocus={() => setActive(item.label)} onBlur={() => setActive(null)} />
						</g>;
					})}
				</svg>
				<div aria-live="polite" className="pointer-events-none absolute inset-[22%] flex flex-col items-center justify-center text-center"><span className="max-w-full truncate text-[10px] font-medium text-[#777973]">{activeItem?.label ?? centerLabel}</span><span className="mt-1 text-lg font-semibold leading-none text-[#20221f]">{activeItem?.detail ?? centerValue}</span></div>
			</div>
			<ul className="grid w-full max-w-xs gap-3 sm:max-w-none">
				{items.map((item) => <li key={item.label} className="flex min-w-0 items-center gap-2 text-sm"><span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="min-w-0 flex-1 truncate text-[#4c4e48]">{item.label}<span className="ml-2 text-xs text-[#858680]">{item.detail}</span></span><span className="font-semibold text-[#292b27]">{item.percentage}%</span></li>)}
			</ul>
		</div>
	);
}

export type TileItem = { label: string; share: number; value: string; color: string };

export function ProportionTiles({ items }: { items: TileItem[] }) {
	return (
		<div className="mt-6 flex h-44 gap-1.5" role="list">
			{items.map((item, index) => (
				<div key={item.label} role="listitem" tabIndex={0} aria-label={`${item.label}: ${item.value}, ${item.share}%`} className="admin-tile group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-md p-3 text-white outline-none transition-[flex-grow,filter] duration-300 hover:brightness-110 focus-visible:brightness-110" style={{ flexGrow: item.share, flexBasis: 0, backgroundColor: item.color, animationDelay: `${index * 120}ms` }}>
					<span className="text-xl font-semibold leading-none tabular-nums">{item.share}%</span>
					<span className="min-w-0"><span className="block truncate text-xs font-semibold">{item.label}</span><span className="mt-0.5 block truncate text-[11px] opacity-85">{item.value}</span></span>
				</div>
			))}
		</div>
	);
}

export type HeatRow = { key: string; label: string; values: number[]; color: string };

export function ActivityHeatmap({ columns, rows, animationKey }: { columns: string[]; rows: HeatRow[]; animationKey: string }) {
	return (
		<div key={animationKey} className="mt-6 overflow-x-auto">
			<div className="grid min-w-72 items-center gap-1.5" style={{ gridTemplateColumns: `minmax(5.5rem, 7rem) repeat(${columns.length}, minmax(0, 1fr))` }}>
				<span />
				{columns.map((column) => <span key={column} className="truncate text-center text-[10px] text-[#82837d]">{column}</span>)}
				{rows.map((row, rowIndex) => {
					const peak = Math.max(...row.values);
					return [
						<span key={`${row.key}-label`} className="truncate text-xs font-medium text-[#4c4e48]">{row.label}</span>,
						...row.values.map((value, index) => <span key={`${row.key}-${index}`} title={`${row.label} · ${columns[index]}: ${value}`} className="admin-heat-cell flex h-9 items-center justify-center rounded-md text-[11px] font-semibold" style={{ backgroundColor: row.color, color: value / peak > 0.55 ? "white" : "#292b27", opacity: 0.18 + 0.82 * (value / peak), animationDelay: `${rowIndex * 120 + index * 45}ms` }}>{value}</span>),
					];
				})}
			</div>
		</div>
	);
}

export type LollipopItem = { key: string; label: string; value: number; display: string; note: string };

export function LollipopChart({ items, color }: { items: LollipopItem[]; color: string }) {
	const max = Math.max(...items.map((item) => item.value));
	return (
		<ul className="mt-5 space-y-4">
			{items.map((item, index) => (
				<li key={item.key}>
					<div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3"><span className="text-sm font-medium text-[#4c4e48]">{item.label}</span><span className="text-xs text-[#777973]">{item.note} · <strong className="text-[#292b27]">{item.display}</strong></span></div>
					<div className="relative h-4"><span className="absolute inset-x-0 top-1/2 h-px bg-[#e8e8e2]" /><span className="admin-lollipop-stem absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full" style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color, animationDelay: `${index * 110}ms` }} /><span className="admin-lollipop-dot absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow" style={{ left: `${(item.value / max) * 100}%`, backgroundColor: color, animationDelay: `${index * 110 + 500}ms` }} /></div>
				</li>
			))}
		</ul>
	);
}
