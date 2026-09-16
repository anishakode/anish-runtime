"use client";

import { useId, useState } from "react";
import { EvidenceBadge } from "@/components/evidence-badge";
import { SourceTraceProvider } from "@/components/source-trace/source-trace-context";
import { SourceTraceTrigger } from "@/components/source-trace/source-trace-trigger";
import {
  relatedLabelsFor,
  XRAY_PRODUCT_LABEL,
  XRAY_PRODUCT_NOTE,
  type XrayLayerId,
  type XrayLayerView,
} from "@/lib/xray/layers";

export function ProjectXray({
  layers,
  causalPanel,
}: {
  layers: XrayLayerView[];
  /** Optional M9 reversible architecture — kept mounted by Autopsy parent. */
  causalPanel?: React.ReactNode;
}) {
  const titleId = useId();
  const [isolatedLayerId, setIsolatedLayerId] = useState<XrayLayerId | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    layers[0]?.components[0]?.id ?? null,
  );

  let selected: {
    layer: XrayLayerView;
    component: XrayLayerView["components"][number];
  } | null = null;
  for (const layer of layers) {
    const hit = layer.components.find((c) => c.id === selectedComponentId);
    if (hit) {
      selected = { layer, component: hit };
      break;
    }
  }

  const related = selected ? relatedLabelsFor(layers, selected.component.id) : [];

  return (
    <SourceTraceProvider>
      <section
        id="project-xray"
        className="project-xray space-y-5"
        aria-labelledby={titleId}
      >
        <header className="space-y-2">
          <p className="eyebrow">{XRAY_PRODUCT_LABEL}</p>
          <h3 id={titleId} className="page-title text-xl">
            Responsibility layers
          </h3>
          <p className="text-sm text-[var(--muted)]">{XRAY_PRODUCT_NOTE}</p>
        </header>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={isolatedLayerId === null ? "chip chip-selected" : "chip"}
            onClick={() => setIsolatedLayerId(null)}
          >
            Show all layers
          </button>
          {layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              className={isolatedLayerId === layer.id ? "chip chip-selected" : "chip"}
              aria-pressed={isolatedLayerId === layer.id}
              onClick={() => setIsolatedLayerId(layer.id)}
            >
              Isolate {layer.title}
            </button>
          ))}
        </div>

        {/* Semantic text equivalent — authoritative; visual dimming is PE */}
        <ol className="xray-layer-list space-y-4" aria-label="X-Ray layers">
          {layers.map((layer) => {
            const dimmed = isolatedLayerId !== null && isolatedLayerId !== layer.id;
            return (
              <li
                key={layer.id}
                className={
                  dimmed
                    ? "xray-layer xray-layer--dimmed border border-[var(--stroke)] p-3"
                    : "xray-layer border border-[var(--stroke)] p-3"
                }
              >
                <h4 className="font-semibold">{layer.title}</h4>
                <p className="mt-1 text-sm text-[var(--muted)]">{layer.summary}</p>
                <ul className="mt-3 space-y-2" aria-label={`${layer.title} components`}>
                  {layer.components.map((component) => {
                    const isSelected = selectedComponentId === component.id;
                    return (
                      <li key={component.id}>
                        <button
                          type="button"
                          className={
                            isSelected
                              ? "w-full border border-[var(--action)] bg-[color-mix(in_srgb,var(--action)_6%,var(--surface))] p-2 text-left"
                              : "w-full border border-[var(--stroke)] p-2 text-left"
                          }
                          aria-pressed={isSelected}
                          disabled={dimmed}
                          onClick={() => setSelectedComponentId(component.id)}
                        >
                          <span className="font-medium">{component.label}</span>
                          <span className="mt-1 block text-sm text-[var(--muted)]">
                            {component.responsibility}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>

        {selected ? (
          <aside
            className="space-y-3 border border-[var(--stroke)] p-3"
            aria-live="polite"
            aria-label="Selected component"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold">{selected.component.label}</h4>
              <EvidenceBadge state={selected.component.evidenceState} />
              <span className="instrument-label text-xs text-[var(--muted)]">
                Layer · {selected.layer.title}
              </span>
            </div>
            <p className="text-sm">{selected.component.responsibility}</p>
            {related.length > 0 ? (
              <p className="text-sm text-[var(--muted)]">
                <span className="instrument-label text-xs">Related · </span>
                {related.join(" · ")}
              </p>
            ) : null}
            <SourceTraceTrigger
              trace={{
                claimLabel: selected.component.label,
                listAnchorId: "project-xray",
                sources: selected.component.sources,
              }}
            >
              Trace component sources
            </SourceTraceTrigger>
          </aside>
        ) : null}

        {causalPanel ? (
          <div className="border-t border-[var(--stroke)] pt-5 space-y-3">
            <p className="instrument-label text-xs text-[var(--muted)]">
              Causal reconstruction (M9)
            </p>
            {causalPanel}
          </div>
        ) : null}
      </section>
    </SourceTraceProvider>
  );
}
