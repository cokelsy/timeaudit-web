export interface BlockLayout {
  id: string;
  columnIndex: number;
  totalColumns: number;
}

interface BlockInput {
  id: string;
  startMs: number;
  endMs: number;
}

export function computeBlockLayout(blocks: BlockInput[]): Map<string, BlockLayout> {
  const result = new Map<string, BlockLayout>();

  if (blocks.length === 0) return result;

  const sorted = [...blocks].sort((a, b) => {
    if (a.startMs !== b.startMs) return a.startMs - b.startMs;
    return (b.endMs - b.startMs) - (a.endMs - a.startMs);
  });

  const groups: BlockInput[][] = [];
  let groupEnd = -1;

  for (const block of sorted) {
    if (block.startMs >= groupEnd) {
      groups.push([block]);
      groupEnd = block.endMs;
    } else {
      groups[groups.length - 1].push(block);
      groupEnd = Math.max(groupEnd, block.endMs);
    }
  }

  for (const group of groups) {
    const columns: { endMs: number; index: number }[] = [];
    const blockColumns = new Map<string, number>();

    for (const block of group) {
      let placed = false;
      for (const col of columns) {
        if (col.endMs <= block.startMs) {
          col.endMs = block.endMs;
          blockColumns.set(block.id, col.index);
          placed = true;
          break;
        }
      }
      if (!placed) {
        const newIndex = columns.length;
        columns.push({ endMs: block.endMs, index: newIndex });
        blockColumns.set(block.id, newIndex);
      }
    }

    const totalColumns = columns.length;

    for (const block of group) {
      result.set(block.id, {
        id: block.id,
        columnIndex: blockColumns.get(block.id)!,
        totalColumns,
      });
    }
  }

  return result;
}