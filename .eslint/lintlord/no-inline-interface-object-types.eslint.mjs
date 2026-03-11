/**
 * @fileoverview Lintlord ESLint plugin/config:
 * Disallow inline object type literals inside interface property types, function/method/arrow
 * parameters, and return types — offering a suggestion (or autofix) to extract them into
 * named interfaces.
 *
 * Why:
 * - Inline object types are hard to reuse and document.
 * - Extracted types improve readability and consistency across the codebase.
 *
 * What it reports (examples):
 * - interface X { events: { a: string }[] }            ❌
 * - interface X { events: Array<{ a: string }> }       ❌
 * - function f(p: { a: string }) {}                    ❌
 * - const f = (p: { a: string }) => {}                 ❌
 * - function f(): { ok: boolean } {}                   ❌
 *
 * What it allows:
 * - interface Event { a: string }
 *   interface X { events: Event[] }                    ✅
 *
 * Suggestion fix / autofix:
 * - Inserts `interface ExtractedName { ... }` immediately before the containing declaration
 *   (or before its leading comment block if present, so comments stay attached).
 * - Replaces the inline literal with the new interface name.
 * - If the containing declaration is exported, the extracted interface is also exported.
 *
 * Naming strategy:
 * - Interface property:  ContainingInterfaceName + SingularizedPropertyName
 *   e.g. LogsData.events -> LogsDataEvent
 * - Function param:      FunctionNamePascal + ParamNamePascal
 *   e.g. handleUserUpdates(parameters) -> HandleUserUpdatesParameters
 * - Method param:        ClassNamePascal + MethodNamePascal + ParamNamePascal
 *   e.g. class X { handleUserUpdates(parameters) } -> XHandleUserUpdatesParameters
 * - Arrow param:         ArrowNamePascal + ParamNamePascal  (or ArrowFunction + ParamNamePascal)
 * - Return type:         CallableNamePascal + Return
 *   e.g. handleUserUpdates(): { ... } -> HandleUserUpdatesReturn
 *
 * Options:
 * - checkInterfaceProperties: boolean (default: true)
 * - checkFunctionParams:      boolean (default: true)
 * - checkMethodParams:        boolean (default: true)
 * - checkArrowFunctionParams: boolean (default: true)
 * - checkReturnTypes:         boolean (default: true)
 * - minMembersToExtract:      number  (default: 1)
 *   Only report inline types with at least this many direct members.
 * - autofix: boolean (default: false)
 *   If true, applies the extraction as an automatic fix (eslint --fix).
 *   ESLint re-runs the rule after each fix pass, so deeply nested inline types are
 *   unwound level-by-level until the file is clean.
 *   When false (default), the fix is offered only as a manual suggestion.
 *
 * Usage (flat config):
 *   import lintlordEslint from './eslint/lintlord/lintlord.eslint.mjs';
 *   export default [
 *     ...lintlordEslint,
 *   ];
 *
 * @author Dmytro Vakulenko
 * @version 2.0.0
 */

/** @type {string} */
export const RULE_NAME = 'no-inline-interface-object-types';

// ---------------------------------------------------------------------------
// Pure utilities (module-level — satisfies unicorn/consistent-function-scoping)
// ---------------------------------------------------------------------------

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
  const lower = s.toLowerCase();

  if (lower.endsWith('ss') || lower.endsWith('us') || lower.endsWith('is') || lower.endsWith('as')) {
    return s;
  }

  if (lower.endsWith('ies') && s.length > 3) {
    return `${s.slice(0, -3)}y`;
  }

  // classes -> class, boxes -> box, watches -> watch
  if (/(sses|shes|ches|xes|zes)$/i.test(s) && s.length > 2) {
    return s.slice(0, -2);
  }

  // events -> event
  if (lower.endsWith('s') && !lower.endsWith('ss') && s.length > 1) {
    return s.slice(0, -1);
  }

  return s;
}

/**
 * Build an interface name from one or more PascalCase name segments joined together.
 *
 * @param {string[]} segments
 * @returns {string}
 */
function buildNameFromSegments(segments) {
  return segments.map((seg) => toPascalCase(seg) || 'Unknown').join('');
}

/**
 * Build extracted interface name for an interface property (Strategy A):
 * ContainingInterfaceName + SingularizedPropertyName
 *
 * @param {string} parentName
 * @param {string} propertyName
 * @returns {string}
 */
function buildInterfacePropertyName(parentName, propertyName) {
  const parentPart = toPascalCase(parentName) || 'Parent';
  const propertyPart = toPascalCase(singularize(propertyName)) || 'Field';

  return `${parentPart}${propertyPart}`;
}

/**
 * Walk child properties of an AST node onto a stack, skipping non-AST fields.
 *
 * @param {any} node
 * @param {any[]} stack
 * @returns {void}
 */
function pushChildNodes(node, stack) {
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || key === 'tokens' || key === 'comments' || key === 'range' || key === 'loc') {
      // skip non-AST / cycle-prone fields
    } else if (value && Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object') {
          stack.push(item);
        }
      }
    } else if (value && typeof value === 'object') {
      stack.push(value);
    }
  }
}

/**
 * Fallback iterative search for TSTypeLiteral inside an unknown node type.
 *
 * @param {any} node
 * @returns {any | null}
 */
function findTypeLiteralIterative(node) {
  /** @type {WeakSet<object>} */
  const visited = new WeakSet();
  const stack = [node];

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current || typeof current !== 'object' || visited.has(current)) {
      // skip nullish, non-objects and already-visited nodes
    } else {
      visited.add(current);

      if (current.type === 'TSTypeLiteral') {
        return current;
      }

      pushChildNodes(current, stack);
    }
  }

  return null;
}

/**
 * Finds the first TSTypeLiteral node inside a type annotation tree.
 * Returns the node itself so we can replace exactly that literal in the suggestion fix.
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
      return (Array.isArray(node.types) && node.types.map((n) => findFirstTypeLiteral(n)).find(Boolean)) || null;
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
        return node.typeArguments.params.map((n) => findFirstTypeLiteral(n)).find(Boolean) || null;
      }

      return null;
    }

    case 'TSFunctionType':
    case 'TSConstructorType': {
      const fromParameters = Array.isArray(node.params) && node.params.map((n) => findFirstTypeLiteral(n)).find(Boolean);

      return fromParameters || findFirstTypeLiteral(node.returnType);
    }

    default: {
      return findTypeLiteralIterative(node);
    }
  }
}

/**
 * Determine whether a TSInterfaceDeclaration is exported.
 * In TypeScript-ESTree, `export interface X {}` is wrapped in ExportNamedDeclaration.
 *
 * @param {any} interfaceNode TSInterfaceDeclaration
 * @returns {boolean}
 */
function isExportedInterface(interfaceNode) {
  const p = interfaceNode?.parent;

  return Boolean(p && p.type === 'ExportNamedDeclaration' && p.declaration === interfaceNode);
}

/**
 * Determine whether a FunctionDeclaration or VariableDeclaration is directly exported.
 *
 * @param {any} node FunctionDeclaration | VariableDeclaration | ClassDeclaration
 * @returns {boolean}
 */
function isDirectlyExported(node) {
  const p = node?.parent;

  return Boolean(p && p.type === 'ExportNamedDeclaration' && p.declaration === node);
}

/**
 * Resolve the property name string from a TSPropertySignature key node.
 *
 * @param {any} key
 * @returns {string}
 */
function resolvePropertyName(key) {
  if (key?.type === 'Identifier') {
    return key.name;
  }

  if (key?.type === 'Literal' && typeof key.value === 'string') {
    return key.value;
  }

  return 'field';
}

/**
 * Extract a simple string name from a function/method key node.
 * Returns null when the name cannot be statically determined.
 *
 * @param {any} keyNode  Identifier | Literal | PrivateIdentifier | computed key
 * @returns {string | null}
 */
function resolveKeyName(keyNode) {
  if (!keyNode) {
    return null;
  }

  if (keyNode.type === 'Identifier' || keyNode.type === 'PrivateIdentifier') {
    return keyNode.name;
  }

  if (keyNode.type === 'Literal' && typeof keyNode.value === 'string') {
    return keyNode.value;
  }

  return null;
}

/**
 * Walk up from a MethodDefinition node to the enclosing ClassDeclaration/ClassExpression
 * and return its name, or "Class" if anonymous/not found.
 * Uses at most 2 parent hops (MethodDefinition -> ClassBody -> ClassDecl).
 *
 * @param {any} methodDefinitionNode MethodDefinition
 * @returns {string}
 */
function getClassNameForMethod(methodDefinitionNode) {
  const classBody = methodDefinitionNode?.parent;

  if (!classBody || classBody.type !== 'ClassBody') {
    return 'Class';
  }

  const classDecl = classBody.parent;

  if (!classDecl) {
    return 'Class';
  }

  if (classDecl.type === 'ClassDeclaration' || classDecl.type === 'ClassExpression') {
    return classDecl.id?.name || 'Class';
  }

  return 'Class';
}

/**
 * Determine whether the class containing a MethodDefinition is directly exported.
 *
 * @param {any} methodDefinitionNode MethodDefinition
 * @returns {boolean}
 */
function isMethodInExportedClass(methodDefinitionNode) {
  const classBody = methodDefinitionNode?.parent;

  if (!classBody || classBody.type !== 'ClassBody') {
    return false;
  }

  const classDecl = classBody.parent;

  if (!classDecl) {
    return false;
  }

  return isDirectlyExported(classDecl);
}

/**
 * For an ArrowFunctionExpression, attempt to resolve the name it is assigned to
 * via its immediate parent VariableDeclarator.
 * Returns null when the arrow is not directly assigned to a named variable.
 *
 * @param {any} arrowNode ArrowFunctionExpression
 * @returns {string | null}
 */
function resolveArrowName(arrowNode) {
  const declarator = arrowNode?.parent;

  if (!declarator || declarator.type !== 'VariableDeclarator') {
    return null;
  }

  if (declarator.id?.type === 'Identifier') {
    return declarator.id.name;
  }

  return null;
}

/**
 * For an ArrowFunctionExpression, find the enclosing VariableDeclaration anchor node
 * (which can be inserted before) and determine whether it is exported.
 * Returns null when the arrow is not directly assigned to a variable.
 *
 * @param {any} arrowNode ArrowFunctionExpression
 * @returns {{ anchorNode: any; shouldExport: boolean } | null}
 */
function resolveArrowAnchor(arrowNode) {
  const declarator = arrowNode?.parent;

  if (!declarator || declarator.type !== 'VariableDeclarator') {
    return null;
  }

  const variableDecl = declarator.parent;

  if (!variableDecl || variableDecl.type !== 'VariableDeclaration') {
    return null;
  }

  const exported = isDirectlyExported(variableDecl);
  // When exported, anchor to the ExportNamedDeclaration wrapper so the inserted
  // interface is placed before the whole `export const ...` statement.
  const anchorNode = exported ? variableDecl.parent : variableDecl;

  return { anchorNode, shouldExport: exported };
}

/**
 * Collect declared interface/type names from the whole program node into the provided set.
 *
 * @param {any} programNode
 * @param {Set<string>} declaredNames
 * @returns {void}
 */
function collectDeclaredNames(programNode, declaredNames) {
  /** @type {WeakSet<object>} */
  const visited = new WeakSet();
  const stack = [programNode];

  while (stack.length > 0) {
    const n = stack.pop();

    if (!n || typeof n !== 'object' || visited.has(n)) {
      // skip nullish, non-objects and already-visited nodes
    } else {
      visited.add(n);

      if (n.type === 'TSInterfaceDeclaration' && n.id?.name) {
        declaredNames.add(n.id.name);
      }

      if (n.type === 'TSTypeAliasDeclaration' && n.id?.name) {
        declaredNames.add(n.id.name);
      }

      pushChildNodes(n, stack);
    }
  }
}

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

/**
 * @type {import('eslint').Rule.RuleModule}
 */
export const noInlineInterfaceObjectTypesRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow inline object type literals inside interface properties, function/method/arrow params, and return types; suggest extracting to a named interface.',
      recommended: false,
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          checkInterfaceProperties: { type: 'boolean' },
          checkFunctionParams: { type: 'boolean' },
          checkMethodParams: { type: 'boolean' },
          checkArrowFunctionParams: { type: 'boolean' },
          checkReturnTypes: { type: 'boolean' },
          minMembersToExtract: { type: 'number', minimum: 1 },
          autofix: { type: 'boolean' },
        },
      },
    ],
    messages: {
      inlineObjectType: 'Inline object type literal found. Extract it to a named interface.',
      extractSuggestion: 'Extract inline object type into a new interface and replace usage.',
    },
  },

  create(context) {
    const { sourceCode } = context;

    const [
      {
        checkInterfaceProperties = true,
        checkFunctionParams: checkFunctionParameters = true,
        checkMethodParams: checkMethodParameters = true,
        checkArrowFunctionParams: checkArrowFunctionParameters = true,
        checkReturnTypes = true,
        minMembersToExtract = 1,
        autofix = false,
      } = {},
    ] = context.options;

    /** @type {Set<string>} */
    const declaredNames = new Set();

    // ------------------------------------------------------------------
    // Inner helpers (need sourceCode / declaredNames / autofix closure)
    // ------------------------------------------------------------------

    /**
     * Returns the safe insertion range:
     * - Before the first leading comment if one exists (so the comment stays attached).
     * - Otherwise, before the node itself.
     *
     * @param {any} anchorNode  The statement/declaration to insert before.
     * @returns {[number, number]}
     */
    function getInsertionRange(anchorNode) {
      const leadingComments = sourceCode.getCommentsBefore(anchorNode) || [];

      if (leadingComments.length > 0) {
        return leadingComments[0].range;
      }

      return anchorNode.range;
    }

    /**
     * Build a unique interface name, appending a numeric suffix on collision.
     *
     * @param {string} candidate
     * @returns {string}
     */
    function resolveUniqueName(candidate) {
      if (!declaredNames.has(candidate)) {
        return candidate;
      }

      let index = 2;

      while (declaredNames.has(`${candidate}${index}`)) {
        index += 1;
      }

      return `${candidate}${index}`;
    }

    /**
     * Build the fixer function: insert the new interface before anchorNode and replace the literal.
     *
     * @param {any}     anchorNode       Statement/declaration to insert before.
     * @param {any}     typeLiteralNode  TSTypeLiteral to replace.
     * @param {string}  newName          Extracted interface name.
     * @param {boolean} shouldExport     Whether to emit `export interface ...`.
     * @returns {(fixer: import('eslint').Rule.RuleFixer) => import('eslint').Rule.Fix[]}
     */
    function makeExtractFix(anchorNode, typeLiteralNode, newName, shouldExport) {
      const literalText = sourceCode.getText(typeLiteralNode);
      const prefix = shouldExport ? 'export ' : '';
      const declText = `${prefix}interface ${newName} ${literalText}\n\n`;
      const insertionRange = getInsertionRange(anchorNode);

      return (fixer) => [fixer.insertTextBeforeRange(insertionRange, declText), fixer.replaceText(typeLiteralNode, newName)];
    }

    /**
     * Build the ESLint report descriptor — direct fix when autofix is on, suggestion otherwise.
     *
     * @param {any}     reportNode
     * @param {any}     anchorNode
     * @param {any}     typeLiteralNode
     * @param {string}  newName
     * @param {boolean} shouldExport
     * @returns {import('eslint').Rule.ReportDescriptor}
     */
    function buildReport(reportNode, anchorNode, typeLiteralNode, newName, shouldExport) {
      const extractFix = makeExtractFix(anchorNode, typeLiteralNode, newName, shouldExport);

      if (autofix) {
        return { node: reportNode, messageId: 'inlineObjectType', fix: extractFix };
      }

      return {
        node: reportNode,
        messageId: 'inlineObjectType',
        suggest: [{ messageId: 'extractSuggestion', fix: extractFix }],
      };
    }

    /**
     * Core check: if the typeAnnotation node contains a qualifying TSTypeLiteral, report it.
     *
     * @param {any}     typeAnnotationNode  The TSTypeAnnotation (or bare type node) to inspect.
     * @param {string}  candidateName       Pre-built candidate interface name.
     * @param {any}     anchorNode          Statement node to insert the new interface before.
     * @param {boolean} shouldExport        Whether the extracted interface should be exported.
     * @param {any}     reportNode          The node to highlight in the lint report.
     */
    function checkTypeAnnotation(typeAnnotationNode, candidateName, anchorNode, shouldExport, reportNode) {
      const typeLiteral = findFirstTypeLiteral(typeAnnotationNode);

      if (!typeLiteral) {
        return;
      }

      if (!Array.isArray(typeLiteral.members) || typeLiteral.members.length < minMembersToExtract) {
        return;
      }

      const newName = resolveUniqueName(candidateName);

      declaredNames.add(newName);

      context.report(buildReport(reportNode, anchorNode, typeLiteral, newName, shouldExport));
    }

    /**
     * Check all parameters of a callable for inline object type annotations.
     *
     * @param {any[]}   params          Array of AST parameter nodes.
     * @param {string}  callablePascal  PascalCase name of the callable (prefix).
     * @param {any}     anchorNode      Statement to insert extracted interfaces before.
     * @param {boolean} shouldExport    Whether to export the extracted interface.
     */
    function checkParameters(parameters, callablePascal, anchorNode, shouldExport) {
      for (const param of parameters) {
        if (param?.typeAnnotation) {
          const paramName = resolvePropertyName(param.type === 'AssignmentPattern' ? param.left : param);
          const candidateName = buildNameFromSegments([callablePascal, paramName]);

          checkTypeAnnotation(param.typeAnnotation, candidateName, anchorNode, shouldExport, param.typeAnnotation);
        }
      }
    }

    /**
     * Check the return type of a callable for an inline object type annotation.
     *
     * @param {any}     returnTypeNode  TSTypeAnnotation node for the return type (node.returnType).
     * @param {string}  callablePascal  PascalCase name of the callable.
     * @param {any}     anchorNode      Statement to insert extracted interfaces before.
     * @param {boolean} shouldExport    Whether to export the extracted interface.
     */
    function checkReturnType(returnTypeNode, callablePascal, anchorNode, shouldExport) {
      if (!returnTypeNode) {
        return;
      }

      const candidateName = buildNameFromSegments([callablePascal, 'Return']);

      checkTypeAnnotation(returnTypeNode, candidateName, anchorNode, shouldExport, returnTypeNode);
    }

    // ------------------------------------------------------------------
    // Visitors
    // ------------------------------------------------------------------

    return {
      Program(node) {
        collectDeclaredNames(node, declaredNames);
      },

      TSInterfaceDeclaration(node) {
        if (!checkInterfaceProperties) {
          return;
        }

        const parentInterfaceName = node.id?.name;

        if (!parentInterfaceName || !node.body || !Array.isArray(node.body.body)) {
          return;
        }

        const anchorNode = isExportedInterface(node) ? node.parent : node;
        const shouldExport = isExportedInterface(node);

        for (const member of node.body.body) {
          if (member?.type === 'TSPropertySignature' && member.typeAnnotation) {
            const propertyName = resolvePropertyName(member.key);
            const candidateName = buildInterfacePropertyName(parentInterfaceName, propertyName);

            checkTypeAnnotation(member.typeAnnotation, candidateName, anchorNode, shouldExport, member.typeAnnotation);
          }
        }
      },

      FunctionDeclaration(node) {
        const functionName = node.id?.name;
        const functionPascal = toPascalCase(functionName || 'Function');
        const anchorNode = isDirectlyExported(node) ? node.parent : node;
        const shouldExport = isDirectlyExported(node);

        if (checkFunctionParameters && Array.isArray(node.params)) {
          checkParameters(node.params, functionPascal, anchorNode, shouldExport);
        }

        if (checkReturnTypes && node.returnType) {
          checkReturnType(node.returnType, functionPascal, anchorNode, shouldExport);
        }
      },

      MethodDefinition(node) {
        const methodName = resolveKeyName(node.key);
        const methodPascal = toPascalCase(methodName || 'Method');
        const className = getClassNameForMethod(node);
        const classDecl = node.parent?.parent;
        const shouldExport = isMethodInExportedClass(node);
        // When the class is exported, anchor to the ExportNamedDeclaration wrapper
        const anchorNode = shouldExport && classDecl ? classDecl.parent : classDecl || node;
        const callable = node.value;

        if (!callable || !Array.isArray(callable.params)) {
          return;
        }

        const callablePascal = buildNameFromSegments([className, methodPascal]);

        if (checkMethodParameters) {
          checkParameters(callable.params, callablePascal, anchorNode, shouldExport);
        }

        if (checkReturnTypes && callable.returnType) {
          checkReturnType(callable.returnType, callablePascal, anchorNode, shouldExport);
        }
      },

      ArrowFunctionExpression(node) {
        const arrowAnchor = resolveArrowAnchor(node);

        if (!arrowAnchor) {
          return;
        }

        const { anchorNode, shouldExport } = arrowAnchor;
        const arrowName = resolveArrowName(node);
        const arrowPascal = toPascalCase(arrowName || 'ArrowFunction');

        if (checkArrowFunctionParameters && Array.isArray(node.params)) {
          checkParameters(node.params, arrowPascal, anchorNode, shouldExport);
        }

        if (checkReturnTypes && node.returnType) {
          checkReturnType(node.returnType, arrowPascal, anchorNode, shouldExport);
        }
      },
    };
  },
};
