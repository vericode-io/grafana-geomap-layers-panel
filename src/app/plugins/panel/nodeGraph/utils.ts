import type { DataFrame } from '@grafana/data';

import type { GraphFrame } from './types';

/**
 * Split nodeGraph-style frames into nodes/edges.
 * Mirrors Grafana core nodeGraph utils for the network map layer.
 */
export function getGraphFrame(frames: DataFrame[]): GraphFrame {
  const nodes: DataFrame[] = [];
  const edges: DataFrame[] = [];

  for (const frame of frames) {
    const name = (frame.name || frame.meta?.custom?.name || '').toString().toLowerCase();
    const metaType = String(frame.meta?.preferredVisualisationType || '').toLowerCase();
    if (name.includes('edge') || metaType.includes('edge')) {
      edges.push(frame);
    } else {
      nodes.push(frame);
    }
  }

  return { nodes, edges };
}
