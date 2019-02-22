import * as ts from 'typescript';

export class DeclarationUsageVisitor {

  /** Set of visited symbols that caused a jump in control flow. */
  private visitedJumpExprSymbols = new Set<ts.Symbol>();

  constructor(private declaration: ts.Node, private typeChecker: ts.TypeChecker) {}

  isReferringToSymbol(node: ts.Node): boolean {
    const symbol = this.typeChecker.getSymbolAtLocation(node);
    return symbol && symbol.valueDeclaration === this.declaration;
  }

  private visitJumpExpression(node: ts.Expression): boolean {
    const callExprSymbol = this.typeChecker.getSymbolAtLocation(node);

    // Note that we should not visit already visited symbols as this could cause cycles.
    if (callExprSymbol && !this.visitedJumpExprSymbols.has(callExprSymbol)) {
      this.visitedJumpExprSymbols.add(callExprSymbol);
      return this.isUsedInNode(callExprSymbol.valueDeclaration);
    }
    return false;
  }

  private visitNewExpression(node: ts.NewExpression): boolean {
    const newExprSymbol = this.typeChecker.getSymbolAtLocation(node.expression);

    // Only handle new expressions which resolve to classes. Technically "new" could
    // also call void functions or objects with a constructor signature. Also note that
    // we should not visit already visited symbols as this could cause cycles.
    if (!newExprSymbol || !ts.isClassDeclaration(newExprSymbol.valueDeclaration) ||
        this.visitedJumpExprSymbols.has(newExprSymbol)) {
      return false;
    }

    const targetClassDecl = newExprSymbol.valueDeclaration;
    const targetConstructor = targetClassDecl.members.find(d => ts.isConstructorDeclaration(d));

    if (targetConstructor) {
      this.visitedJumpExprSymbols.add(newExprSymbol);
      return this.isUsedInNode(targetConstructor)
    }
    return false;
  }

  isUsedInNode(node: ts.Node): boolean {
    if (ts.isIdentifier(node) && this.isReferringToSymbol(node)) {
      return true;
    }

    // Handle call expressions within TypeScript nodes. These should be also visited.
    if (ts.isCallExpression(node) && this.visitJumpExpression(node.expression)) {
      this.visitedJumpExprSymbols.clear();
      return true;
    }

    // Handle new expressions that
    if (ts.isNewExpression(node) && this.visitNewExpression(node)) {
      this.visitedJumpExprSymbols.clear();
      return true;
    }

    for (const child of node.getChildren()) {
      if (this.isUsedInNode(child)) {
        return true;
      }
    }

    return false;
  }
}
