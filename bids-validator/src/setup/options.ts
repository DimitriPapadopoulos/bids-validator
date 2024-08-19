import { type LevelName, LogLevelNames } from '@std/log'
import { Command, EnumType } from '@cliffy/command'
import { getVersion } from '../version.ts'

export type ValidatorOptions = {
  datasetPath: string
  schema?: string
  legacy?: boolean
  json?: boolean
  verbose?: boolean
  ignoreNiftiHeaders?: boolean
  filenameMode?: boolean
  debug: LevelName
  color?: boolean
  blacklistModalities: string[]
}

const modalityType = new EnumType<string>(
  ['MRI', 'PET', 'MEG', 'EEG', 'iEEG', 'Microscopy', 'NIRS', 'MRS'],
)

const validateCommand = new Command()
  .name('bids-validator')
  .type('debugLevel', new EnumType(LogLevelNames))
  .description(
    'This tool checks if a dataset in a given directory is compatible with the Brain Imaging Data Structure specification. To learn more about Brain Imaging Data Structure visit http://bids.neuroimaging.io',
  )
  .arguments('<dataset_directory>')
  .option('--json', 'Output machine readable JSON')
  .option(
    '-s, --schema <type:string>',
    'Specify a schema version to use for validation',
    {
      default: 'latest',
    },
  )
  .option('-v, --verbose', 'Log more extensive information about issues')
  .option(
    '--ignoreNiftiHeaders',
    'Disregard NIfTI header content during validation',
  )
  .option('--debug <type:debugLevel>', 'Enable debug output', {
    default: 'ERROR',
  })
  .option(
    '--filenameMode',
    'Enable filename checks for newline separated filenames read from stdin',
  )
  .type('modality', modalityType)
  .option(
    '--blacklistModalities <...modalities:modality>',
    'Array of modalities to error on if detected.',
    { default: [] as string[] },
  )

// Disabling color output is only available in Deno
if (typeof Deno !== 'undefined') {
  validateCommand
    .option(
      '--color, --no-color [color:boolean]',
      'Enable/disable color output (defaults to detected support)',
      {
        default: Deno.stdout.isTerminal() || !!Deno.env.get('FORCE_COLOR'),
      },
    )
}

/**
 * Parse command line options and return a ValidatorOptions config
 * @param argumentOverride Override the arguments instead of using Deno.args
 */
export async function parseOptions(
  argumentOverride: string[] = Deno.args,
): Promise<ValidatorOptions> {
  const version = await getVersion()
  const { args, options } = await validateCommand.version(version)
    .parse(argumentOverride)
  return {
    datasetPath: args[0],
    ...options,
    debug: options.debug as LevelName,
  }
}
