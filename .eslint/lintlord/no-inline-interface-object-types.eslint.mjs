/**
 * @fileoverview Lintlord ESLint plugin/config:
 * Disallow inline object type literals inside interface property types and offer a suggestion
 * to extract them into a named interface.
 *
 * Why:
 * - Inline object types inside interfaces are hard to reuse and document.
 * - Extracted types improve readability and consistency across the codebase.
 *
 * What it reports (examples):
 * - interface X { events: { a: string }[] }            ❌
 * - interface X { events: Array<{ a: string }> }       ❌
 * - interface X { events: Readonly<{ a: string }> }    ❌
 * - interface X { events: ({ a: string } | null)[] }   ❌
 *
 * What it allows:
 * - interface Event { a: string }
 *   interface X { events: Event[] }                    ✅
 *
 * Suggestion fix:
 * - Inserts `interface <Parent><SingularProp> { ... }` above the containing interface
 *   (or above its leading comment block if present).
 * - Replaces the inline `{ ... }` type literal inside the property type with the new interface name.
 * - If the containing interface is exported, the extracted interface is exported too.
 *
 * Naming strategy:
 * - <ParentInterfaceName> + <SingularizedPropertyName>
 *   e.g. LogsData + events -> LogsDataEvent
 *
 * Singularization rules are conservative to avoid cases like `access` -> `acces`.
 *
 * Options:
 * - allowTypeAliases: boolean (default: true)
 *   If false, also reports `type X = { ... }` (no suggestion fix provided for aliases by default).
 *
 * Usage (flat config):
 *   import lintlordEslint from './eslint/lintlord/lintlord.eslint.mjs';
 *   export default [
 *     ...lintlordEslint,
 *   ];
 *
 * @author Dmytro Vakulenko
 * @version 1.1.0
 */

/** @type {string} */
export const RULE_NAME = 'no-inline-interface-object-types';

/**
 * Convert a string to PascalCase.
 * Keeps alphanumerics and splits on non-alphanumeric boundaries.
 *
 * @param {string} input
 * @returns {string}
 */
function toPascalCase(input) {
  return String(input)
    .replaceAll(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

/**
 * Conservative singularization for property names.
 * - companies -> company
 * - classes -> class
 * - events -> event
 * - access -> access (protected)
 *
 * @param {string} name
 * @returns {string}
 */
function singularize(name) {
  const s = String(name);

  // Protect common endings where removing 's' is usually wrong
  // access, class, status, analysis, alias, etc.
  const lower = s.toLowerCase();

  if (lower.endsWith('ss') || lower.endsWith('us') || lower.endsWith('is') || lower.endsWith('as')) {
    return s;
  }

  if (lower.endsWith('ies') && s.length > 3) {
    return `${s.slice(0, -3)}y`;
  }

  // classes -> class, boxes -> box, watches -> watch
  if (/(sses|shes|ches|xes|zes)$/i.test(s) && s.length > 2) {
    return s.slice(0, -2); // remove 'es'
  }

  // events -> event
  if (lower.endsWith('s') && !lower.endsWith('ss') && s.length > 1) {
    return s.slice(0, -1);
  }

  return s;
}

/**
 * Recursively checks if a TS type node contains a TSTypeLiteral (inline `{ ... }` type).
 *
 * @param {any} node
 * @returns {boolean}
 */
function containsTypeLiteral(node) {
  return Boolean(findFirstTypeLiteral(node));
}

/**
 * Finds the first TSTypeLiteral node inside a type annotation tree.
 * Returns the node itself (so we can replace exactly that literal in the suggestion fix).
 *
 * @param {any} node
 * @returns {any | null}
 */
function findFirstTypeLiteral(node) {
  if (!node) {
    return null;
  }

  if (node.type === 'TSTypeLiteral') {
    return node;
  }

  switch (node.type) {
    case 'TSTypeAnnotation': {
      return findFirstTypeLiteral(node.typeAnnotation);
    }

    case 'TSArrayType': {
      return findFirstTypeLiteral(node.elementType);
    }

    case 'TSParenthesizedType': {
      return findFirstTypeLiteral(node.typeAnnotation);
    }

    case 'TSUnionType':
    case 'TSIntersectionType': {
      return (Array.isArray(node.types) && node.types.map(findFirstTypeLiteral).find(Boolean)) || null;
    }

    case 'TSTypeOperator': {
      return findFirstTypeLiteral(node.typeAnnotation);
    }

    case 'TSIndexedAccessType': {
      return findFirstTypeLiteral(node.objectType) || findFirstTypeLiteral(node.indexType);
    }

    case 'TSConditionalType': {
      return (
        findFirstTypeLiteral(node.checkType) ||
        findFirstTypeLiteral(node.extendsType) ||
        findFirstTypeLiteral(node.trueType) ||
        findFirstTypeLiteral(node.falseType)
      );
    }

    case 'TSInferType': {
      return findFirstTypeLiteral(node.typeParameter);
    }

    case 'TSMappedType': {
      return findFirstTypeLiteral(node.typeAnnotation) || findFirstTypeLiteral(node.typeParameter) || findFirstTypeLiteral(node.nameType);
    }

    case 'TSTypeReference': {
      if (node.typeArguments && node.typeArguments.type === 'TSTypeParameterInstantiation' && Array.isArray(node.typeArguments.params)) {
        return node.typeArguments.params.map(findFirstTypeLiteral).find(Boolean) || null;
      }

      return null;
    }

    case 'TSFunctionType':
    case 'TSConstructorType': {
      const fromParameters = Array.isArray(node.params) && node.params.map(findFirstTypeLiteral).find(Boolean);

      return fromParameters || findFirstTypeLiteral(node.returnType);
    }

    default: {
      /** @type {WeakSet<object>} */
      const visited = new WeakSet();

      const stack = [node];

      while (stack.length > 0) {
        const current = stack.pop();

        if (!current || typeof current !== 'object') {
          continue;
        }

        if (visited.has(current)) {
          continue;
        }

        visited.add(current);

        if (current.type === 'TSTypeLiteral') {
          return current;
        }

        for (const [key, value] of Object.entries(current)) {
          if (key === 'parent' || key === 'tokens' || key === 'comments' || key === 'range' || key === 'loc') {
            continue;
          }

          if (!value) {
            continue;
          }

          if (Array.isArray(value)) {
            for (const it of value) {
              if (it && typeof it === 'object') {
                stack.push(it);
              }
            }
          } else if (typeof value === 'object') {
            stack.push(value);
          }
        }
      }

      return null;
    }
  }
}

/**
 * Determine whether a TSInterfaceDeclaration is exported.
 * In TypeScript-ESTree, `export interface X {}` is typically wrapped in ExportNamedDeclaration.
 *
 * @param {any} interfaceNode TSInterfaceDeclaration
 * @returns {boolean}
 */
function isExportedInterface(interfaceNode) {
  const p = interfaceNode?.parent;

  return Boolean(p && p.type === 'ExportNamedDeclaration' && p.declaration === interfaceNode);
}

/**
 * @type {import('eslint').Rule.RuleModule}
 */
export const noInlineInterfaceObjectTypesRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow inline object type literals inside interface property types; suggest extracting to a named interface.',
      recommended: false,
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowTypeAliases: { type: 'boolean' },
        },
      },
    ],
    messages: {
      inlineObjectType:
        'Inline object type literal is not allowed in interface properties. Extract it to a named type/interface and reference it.',
      inlineObjectTypeAlias:
        'Inline object type literal is not allowed in type aliases. Prefer a named interface/type with a meaningful name.',
      extractSuggestion: 'Extract inline object type into a new interface and replace usage.',
    },
  },

  create(context) {
    const { sourceCode } = context;
    const [{ allowTypeAliases = true } = {}] = context.options;

    // Collect declared names to avoid collisions (even though Strategy A makes this rare)
    /** @type {Set<string>} */
    const declaredNames = new Set();

    function collectDeclaredNames(programNode) {
      /** @type {WeakSet<object>} */
      const visited = new WeakSet();

      const stack = [programNode];

      while (stack.length > 0) {
        const n = stack.pop();

        if (!n || typeof n !== 'object') {
          continue;
        }

        if (visited.has(n)) {
          continue;
        }

        visited.add(n);

        if (n.type === 'TSInterfaceDeclaration' && n.id?.name) {
          declaredNames.add(n.id.name);
        }

        if (n.type === 'TSTypeAliasDeclaration' && n.id?.name) {
          declaredNames.add(n.id.name);
        }

        // Walk child AST nodes safely
        for (const [key, value] of Object.entries(n)) {
          // Prevent cycles / non-AST junk
          if (key === 'parent' || key === 'tokens' || key === 'comments' || key === 'range' || key === 'loc') {
            continue;
          }

          if (!value) {
            continue;
          }

          if (Array.isArray(value)) {
            for (const it of value) {
              if (it && typeof it === 'object') {
                stack.push(it);
              }
            }
          } else if (typeof value === 'object') {
            stack.push(value);
          }
        }
      }
    }

    /**
     * Build extracted interface name using Strategy A:
     * <ParentInterfaceName> + <SingularizedPropertyName>
     *
     * @param {string} parentName
     * @param {string} propName
     * @returns {string}
     */
    function buildInterfaceName(parentName, propertyName) {
      const parentPart = toPascalCase(parentName) || 'Parent';
      const singularProperty = singularize(propertyName);
      const propertyPart = toPascalCase(singularProperty) || 'Field';

      return `${parentPart}${propertyPart}`;
    }

    /**
     * Returns a safe insertion point:
     * - If the interface has leading comments directly before it, insert BEFORE the first leading comment
     *   so the comment stays attached to the original interface.
     * - Otherwise, insert before the interface itself.
     *
     * @param {any} interfaceNode TSInterfaceDeclaration (or ExportNamedDeclaration wrapper)
     * @returns {{ range: [number, number], isBeforeComment: boolean }}
     */
    function getInsertionTarget(interfaceNode) {
      // If exported, interfaceNode might be TSInterfaceDeclaration but parent is ExportNamedDeclaration.
      const exportWrapper = interfaceNode?.parent?.type === 'ExportNamedDeclaration' ? interfaceNode.parent : null;

      const targetNode = exportWrapper || interfaceNode;

      const leadingComments = sourceCode.getCommentsBefore(targetNode) || [];

      if (leadingComments.length > 0) {
        const first = leadingComments[0];

        return { range: first.range, isBeforeComment: true };
      }

      return { range: targetNode.range, isBeforeComment: false };
    }

    /**
     * Suggestion fixer: insert new interface above containing interface and replace the inline literal with its name.
     *
     * @param {any} containingInterface TSInterfaceDeclaration
     * @param {any} propMember TSPropertySignature
     * @param {any} typeLiteralNode TSTypeLiteral
     * @param {string} newName
     * @returns {(fixer: import('eslint').Rule.RuleFixer) => import('eslint').Rule.Fix[]}
     */
    function makeExtractFix(containingInterface, propertyMember, typeLiteralNode, newName) {
      const shouldExport = isExportedInterface(containingInterface);

      // Use the original text of the literal `{ ... }` as the interface body
      const literalText = sourceCode.getText(typeLiteralNode);

      // Insert with spacing: ensure a blank line after the new interface.
      // If we insert before a comment, we keep comment attached to original interface, so we add extra newline.
      const declText = `${shouldExport ? 'export ' : ''}interface ${newName} ${literalText}\n\n`;

      const insertion = getInsertionTarget(containingInterface);

      return (fixer) => {
        /** @type {import('eslint').Rule.Fix[]} */
        const fixes = [];

        // Insert extracted interface
        fixes.push(fixer.insertTextBeforeRange(insertion.range, declText));

        // Replace just the inline type literal node (preserves wrappers like [] / Array<> / unions)
        fixes.push(fixer.replaceText(typeLiteralNode, newName));

        return fixes;
      };
    }

    return {
      Program(node) {
        collectDeclaredNames(node);
      },

      TSInterfaceDeclaration(node) {
        const parentInterfaceName = node.id?.name;

        if (!parentInterfaceName) {
          return;
        }

        const { body } = node;

        if (!body || !Array.isArray(body.body)) {
          return;
        }

        for (const member of body.body) {
          if (member?.type !== 'TSPropertySignature') {
            continue;
          }

          if (!member.typeAnnotation) {
            continue;
          }

          const typeLiteral = findFirstTypeLiteral(member.typeAnnotation);

          if (!typeLiteral) {
            continue;
          }

          // Property name: only handle simple identifiers safely
          const { key } = member;

          const propertyName =
            key?.type === 'Identifier' ? key.name : (key?.type === 'Literal' && typeof key.value === 'string' ? key.value : 'field');

          let newName = buildInterfaceName(parentInterfaceName, propertyName);

          // Very rare with Strategy A, but keep a safety net:
          if (declaredNames.has(newName)) {
            let index = 2;

            while (declaredNames.has(`${newName}${index}`)) {
              index += 1;
            }

            newName = `${newName}${index}`;
          }

          declaredNames.add(newName);

          context.report({
            node: member.typeAnnotation,
            messageId: 'inlineObjectType',
            suggest: [
              {
                messageId: 'extractSuggestion',
                fix: makeExtractFix(node, member, typeLiteral, newName),
              },
            ],
          });
        }
      },

      TSTypeAliasDeclaration(node) {
        if (allowTypeAliases) {
          return;
        }

        if (containsTypeLiteral(node.typeAnnotation)) {
          context.report({
            node: node.typeAnnotation,
            messageId: 'inlineObjectTypeAlias',
          });
        }
      },
    };
  },
};
