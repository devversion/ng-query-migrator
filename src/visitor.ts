import * as ts from 'typescript';
import {getAngularDecorators} from "./angular/decorators";

export class QueryAstVisitor {

  constructor(public typeChecker: ts.TypeChecker) {}

  visitNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
        this.visitClassDeclaration(node as ts.ClassDeclaration);
        break;
    }

    ts.forEachChild(node, node => this.visitNode(node));
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    if (!node.decorators || !node.decorators.length) {
      return;
    }

    const ngDecorators = getAngularDecorators(this.typeChecker, node.decorators);

    // Ensure that the current class declaration is either a component or directive.
    if (!ngDecorators.some(({name}) => name === 'Component' || name === 'Directive')) {
      return;
    }

    const propDeclarations = node.members
      .filter(m => ts.isPropertyDeclaration(m))
      .filter(p => p.decorators && p.decorators.length) as ts.PropertyDeclaration[];

    // Skip this class if there are no property declarations with decorators.
    if (!propDeclarations.length) {
      return;
    }

    // Filter out all property declarations which declare Angular view/content queries.
    const queryProperties = propDeclarations
      .map(n => ({node: n, decorators: getAngularDecorators(this.typeChecker, n.decorators)}))
      .filter(({decorators}) => decorators && decorators.some(d =>
          d.name === 'ViewChild' || d.name === 'ContentChild'));



    console.log(node.name.text, queryProperties.map(d => d.node.getText()));
  }
}
