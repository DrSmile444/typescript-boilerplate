// @ts-check
import { createFolderStructure } from 'eslint-plugin-project-structure';

// Helper function for defining file naming conventions by type
export const getFolderConfig = ({ type }) => `{kebab-case}.${type}.(ts|js|mjs)`;

export const getGenericFolder = ({ type }) => ({
  children: [{ name: getFolderConfig({ type }) }, { name: '{kebab-case}', children: [{ ruleId: `${type}Rule` }] }],
});

// Main folder structure configuration
export const folderStructureConfig = createFolderStructure({
  structure: [
    // Root-level files
    { name: '*' },

    // Allow any folders in the root of your project.
    { name: '*', children: [] },

    // .eslint folder for ESLint configurations
    {
      name: '.eslint',
      children: [{ name: getFolderConfig({ type: 'eslint' }) }, { name: '{kebab-case}.eslintrc.(json|js|json5)' }],
    },

    // Apply fixture rule for organized test data files
    { name: 'fixtures', ruleId: 'fixtureRule' },

    // Apply interface rule for TypeScript interfaces
    { name: 'interfaces', ruleId: 'interfaceRule' },

    // Apply page rule for Page Object Model (POM) files
    { name: 'pages', ruleId: 'pageRule' },

    // Apply test rule for Playwright test cases and setups
    { name: 'tests', ruleId: 'specRule' },

    // Apply utility rule for shared helper files
    { name: 'utils', ruleId: 'utilRule' },
  ],
  rules: {
    fixtureRule: getGenericFolder({ type: 'fixture' }),
    interfaceRule: {
      children: [{ name: 'index.ts' }, ...getGenericFolder({ type: 'interface' }).children],
    },
    pageRule: getGenericFolder({ type: 'page' }),
    specRule: {
      children: [{ name: getFolderConfig({ type: 'setup' }) }, ...getGenericFolder({ type: 'spec' }).children],
    },
    utilRule: getGenericFolder({ type: 'util' }),
  },
});
