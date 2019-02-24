import * as ts from 'typescript';
import {dirname, join} from 'path';
import {parseTsconfigFile} from "./typescript/tsconfig";
import {NgQueryResolveVisitor} from "./angular/ng_query_visitor";
import {analyzeNgQueryUsage, QueryType} from "./angular/analyze_query_usage";

const configPath = join(__dirname, '../test-fixture/tsconfig.json');

const parsed = parseTsconfigFile(configPath, dirname(configPath));
const host = ts.createCompilerHost(parsed.options, true);
const program = ts.createProgram(parsed.fileNames, parsed.options, host);
const typeChecker = program.getTypeChecker();
const queryVisitor = new NgQueryResolveVisitor(typeChecker);
const rootSourceFiles = program.getRootFileNames().map(f => program.getSourceFile(f));
const printer = ts.createPrinter();

// Analyze source files by detecting queries and class relations.
rootSourceFiles.forEach(sourceFile => queryVisitor.visitNode(sourceFile));

const {resolvedQueries, derivedClasses} = queryVisitor;

derivedClasses.forEach((derivedClasses, classDecl) => {
  console.log(classDecl.name.text, '--> Used in:', derivedClasses.map(d => d.name.text))
});

// Compute the query usage for all resolved queries.
resolvedQueries.forEach(q => {
  const usage = analyzeNgQueryUsage(q, derivedClasses, typeChecker);
  const queryExpr = q.decorator.node.expression as ts.CallExpression;
  const queryArguments = queryExpr.arguments;

  let optionsNode: ts.ObjectLiteralExpression;

  // If the query decorator is already called with two arguments, then
  // we need to update the existing object literal.
  if (queryArguments.length === 2) {
    optionsNode = queryArguments[1] as ts.ObjectLiteralExpression;

    // In case the options already contain a property for the "static" flag, we just
    // skip this query and leave it untouched.
    if (optionsNode.properties.some(p => (ts.isIdentifier(p.name) || ts.isStringLiteralLike(p.name))
      && p.name.text === 'static')) {
      return;
    }
  } else {
    optionsNode = ts.createObjectLiteral();
  }

  optionsNode = ts.updateObjectLiteral(optionsNode, optionsNode.properties.concat(
    ts.createPropertyAssignment('static',
        usage === QueryType.STATIC ? ts.createTrue() : ts.createFalse())));

  console.log('Updated query options', printer.printNode(ts.EmitHint.Unspecified, optionsNode,
      queryExpr.getSourceFile()));
});
