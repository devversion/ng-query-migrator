import * as ts from 'typescript';
import {dirname, join} from 'path';
import {parseTsconfigFile} from "./typescript/tsconfig";
import {createLanguageService} from "./typescript/language-service";
import {NgQueryResolveVisitor} from "./angular/ng_query_visitor";
import {analyzeNgQueryUsage, QueryType} from "./angular/analyze_query_usage";

const configPath = join(__dirname, '../test-fixture/tsconfig.json');

const parsed = parseTsconfigFile(configPath, dirname(configPath));
const host = ts.createCompilerHost(parsed.options, true);
const program = ts.createProgram(parsed.fileNames, parsed.options, host);
const languageService = createLanguageService(program, host);
const typeChecker = program.getTypeChecker();

program.getRootFileNames().forEach(rootFileName => {
  const sourceFile = program.getSourceFile(rootFileName);
  const visitor = NgQueryResolveVisitor.resolve(sourceFile, typeChecker);
  const {resolvedQueries, derivedClasses} = visitor;

  derivedClasses.forEach((derivedClasses, classDecl) => {
    console.log(classDecl.name.text, 'used in:', derivedClasses.map(d => d.name.text))
  });

  // Compute the query usage for all resolved queries.
  resolvedQueries.forEach(q => {
    const usage = analyzeNgQueryUsage(q, derivedClasses, typeChecker);

    console.error(rootFileName, usage === QueryType.DYNAMIC ? 'dynamic' : 'static', q.property.name.getText());
  });
});
