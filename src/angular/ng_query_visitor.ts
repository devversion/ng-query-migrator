import * as ts from 'typescript';
import {getAngularDecorators} from './decorators';
import {NgQueryDefinition} from "./query-definition";
import {findParentClassDeclaration, getBaseTypeIdentifiers} from "../typescript/class_declaration";

export type DerivedClassesMap = Map<ts.ClassDeclaration, ts.ClassDeclaration[]>;

export class NgQueryResolveVisitor {

  /** Resolved Angular query definitions. */
  resolvedQueries: NgQueryDefinition[] = [];

  /** Maps a class declaration to all class declarations that derive from it. */
  derivedClasses: DerivedClassesMap = new Map<ts.ClassDeclaration, ts.ClassDeclaration[]>();

  constructor(public typeChecker: ts.TypeChecker) {}

  visitNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.PropertyDeclaration:
        this.visitPropertyDeclaration(node as ts.PropertyDeclaration);
        break;
      case ts.SyntaxKind.ClassDeclaration:
        this.visitClassDeclaration(node as ts.ClassDeclaration);
        break;
    }

    ts.forEachChild(node, node => this.visitNode(node));
  }

  visitPropertyDeclaration(node: ts.PropertyDeclaration) {
    if (!node.decorators || !node.decorators.length) {
      return;
    }

    const ngDecorators = getAngularDecorators(this.typeChecker, node.decorators);
    const queryDecorator = ngDecorators
        .find(({name}) => name === 'ViewChild' || name === 'ContentChild');

    // Ensure that the current property declaration is defining a query.
    if (!queryDecorator) {
      return;
    }

    const queryContainer = findParentClassDeclaration(node);

    // If the query is not located within a class declaration, skip this node.
    if (!queryContainer) {
      return;
    }

    this.resolvedQueries.push({
      property: node,
      decorator: queryDecorator,
      container: queryContainer,
    })
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    const baseTypes = getBaseTypeIdentifiers(node);

    if (!baseTypes || !baseTypes.length) {
      return;
    }

    baseTypes.forEach(baseTypeIdentifier => {
      // We need to resolve the value declaration through the resolved type as the base
      // class could be declared in different source files and the local symbol won't
      // contain a value declaration as the value is not declared locally.
      const symbol = this.typeChecker.getTypeAtLocation(baseTypeIdentifier).getSymbol();

      if (!symbol || !symbol.valueDeclaration) {
        return;
      }

      this._recordClassInheritance(node, symbol.valueDeclaration as ts.ClassDeclaration);
    });
  }

  private _recordClassInheritance(node: ts.ClassDeclaration, superClass: ts.ClassDeclaration) {
    const existingInheritances = this.derivedClasses.get(superClass) || [];

    // Track all classes that derive from the given superclass.
    this.derivedClasses.set(superClass, existingInheritances.concat(node))
  }
}
