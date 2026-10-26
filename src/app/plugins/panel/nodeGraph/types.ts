import type { DataFrame } from '@grafana/data';

/** Minimal stand-in for Grafana core nodeGraph GraphFrame (not shipped in plugin SDK). */
export type GraphFrame = {
  nodes: DataFrame[];
  edges: DataFrame[];
};
