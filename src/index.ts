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

program.getRootFileNames()
  .map(fileName => program.getSourceFile(fileName))
  .forEach(sourceFile => queryVisitor.visitNode(sourceFile));

const {resolvedQueries, derivedClasses} = queryVisitor;

derivedClasses.forEach((derivedClasses, classDecl) => {
  console.log(classDecl.name.text, '--> Used in:', derivedClasses.map(d => d.name.text))
});

// Compute the query usage for all resolved queries.
resolvedQueries.forEach(q => {
  const usage = analyzeNgQueryUsage(q, derivedClasses, typeChecker);

  console.error(usage === QueryType.DYNAMIC ? 'dynamic' : 'static',
      q.property.name.getText());
});
