import * as ts from 'typescript';

/** Determines the base type identifiers of a specified class declaration. */
export function getBaseTypeIdentifiers(node: ts.ClassDeclaration): ts.Identifier[] | null {
  if (!node.heritageClauses) {
    return null;
  }

  return node.heritageClauses
    .filter(clause => clause.token === ts.SyntaxKind.ExtendsKeyword)
    .reduce((types, clause) => types.concat(clause.types), [] as ts.ExpressionWithTypeArguments[])
    .map(typeExpression => typeExpression.expression)
    .filter(expression => ts.isIdentifier(expression)) as ts.Identifier[];
}

/** Gets the first parent class declaration of a given node. */
export function findParentClassDeclaration(node: ts.Node): ts.ClassDeclaration|null {
  while (!ts.isClassDeclaration(node)) {
    if (ts.isSourceFile(node)) {
      return null;
    }

    node = node.parent;
  }

  return node;
}
