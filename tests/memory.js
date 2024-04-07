import {config, takeNodeMinimalHeap, tagObject} from '@memlab/core'

test('memory test', async () => {
  const o1 = {}
  let o2 = {}

  tagObject(o1, 'memlab-mark-1')
  tagObject(o2, 'memlab-mark-2')

  o2 = null

  const heap = await takeNodeMinimalHeap()

  expect(heap.hasObjectWithTag('memlab-mark-1')).toBe(true)

  expect(heap.hasObjectWithTag('memlab-mark-2')).toBe(false)

}, 30000)