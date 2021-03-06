import * as ts from "typescript";

export type Import = {name: string, importModule: string};

/** Gets import information about the specified identifier by using the Type checker. */
export function getImportOfIdentifier(typeChecker: ts.TypeChecker, node: ts.Identifier)
    : Import | null {

  const symbol = typeChecker.getSymbolAtLocation(node);

  if (!symbol || !symbol.declarations.length) {
    return null;
  }

  const decl = symbol.declarations[0];

  if (!ts.isImportSpecifier(decl)) {
    return null;
  }

  const importDecl = decl.parent.parent.parent;

  if (!ts.isStringLiteral(importDecl.moduleSpecifier)) {
    return null;
  }

  return {
    // Handles aliased imports: e.g. "import {Component as myComp} from ...";
    name: decl.propertyName ? decl.propertyName.text : decl.name.text,
    importModule: importDecl.moduleSpecifier.text
  };
}
