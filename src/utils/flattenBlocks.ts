import type { Block } from '../types/workout';

export function flattenBlocks(blocks: Block[]): Block[] {
  const result: Block[] = [];
  for (const block of blocks) {
    if (block.type === 'repeat') {
      for (let i = 0; i < block.times; i++) {
        result.push(...flattenBlocks(block.children));
      }
    } else {
      result.push(block);
    }
  }
  return result;
}
