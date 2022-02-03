import { assert, assertEquals } from '../deps/asserts.ts'
import { BIDSContext } from './context.ts'
import { walkFileTree } from './walk.ts'
import {
  simpleDataset,
  simpleDatasetFileCount,
} from '../tests/simple-dataset.ts'

Deno.test('file tree walking', async t => {
  await t.step('visits each file and creates a BIDSContext', async () => {
    for await (const context of walkFileTree(simpleDataset)) {
      assert(
        context instanceof BIDSContext,
        'walk file tree did not return a BIDSContext',
      )
    }
  })
  await t.step('visits every file expected', async () => {
    let accumulator = 0
    for await (const context of walkFileTree(simpleDataset)) {
      assert(
        context instanceof BIDSContext,
        'walk file tree did not return a BIDSContext',
      )
      accumulator = accumulator + 1
    }
    assertEquals(
      accumulator,
      simpleDatasetFileCount,
      'visited file count does not match expected value',
    )
  })
})
