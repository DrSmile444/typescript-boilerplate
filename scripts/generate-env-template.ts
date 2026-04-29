import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as z from 'zod';

import { environmentSchema } from '@config/environment.schema';

interface FieldMeta {
  description: string;
  example: string;
  type: 'boolean' | 'string';
}

/**
 * Reads the Zod globalRegistry metadata for a single schema field.
 * Throws if the field was not registered with the required metadata.
 * @param field - The Zod schema for the field.
 * @param key - The env var name, used in the error message.
 * @returns The validated field metadata.
 */
function getFieldMeta(field: z.ZodType, key: string): FieldMeta {
  const meta = z.globalRegistry.get(field) as Partial<FieldMeta> | undefined;

  if (!meta?.description || meta.type === undefined) {
    throw new Error(`Missing .describe() / .meta() on env var "${key}"`);
  }

  return meta as FieldMeta;
}

/**
 * Builds the contents of a `.env.template` file from the schema shape and its embedded metadata.
 * @param schema - The zod object schema whose keys define the env var names.
 * @returns A string ready to be written as a `.env.template` file.
 */
function buildTemplateContent(schema: typeof environmentSchema): string {
  const blocks = Object.entries(schema.shape).map(([key, field]) => {
    const { description, example, type } = getFieldMeta(field as z.ZodType, key);
    const defaultSuffix = example ? ` = ${example}` : '';
    const typeAnnotation = type === 'boolean' ? '{boolean} = false' : `{string}${defaultSuffix}`;

    return ['##', `# ${description}`, '#', `# @optional ${typeAnnotation}`, `${key}=${example}`].join('\n');
  });

  return `${blocks.join('\n\n')}\n`;
}

const content = buildTemplateContent(environmentSchema);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(scriptDirectory, '..', '.env.template');

writeFileSync(outputPath, content, 'utf8');

console.info(`Generated ${outputPath}`);
