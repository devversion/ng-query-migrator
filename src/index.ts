import * as ts from 'typescript';
import {dirname, join} from 'path';
import {parseTsconfigFile} from "./typescript/tsconfig";
import {createLanguageService} from "./typescript/language-service";
import {NgQueryResolveVisitor} from "./angular/ng_query_visitor";
import {computeNgQueryUsage} from "./angular/compute_query_usage";

const configPath = join(__dirname, '../test-fixture/tsconfig.json');

const parsed = parseTsconfigFile(configPath, dirname(configPath));
const host = ts.createCompilerHost(parsed.options, true);
const program = ts.createProgram(parsed.fileNames, parsed.options, host);
const languageService = createLanguageService(program, host);

program.getRootFileNames().forEach(rootFileName => {
  const sourceFile = program.getSourceFile(rootFileName);
  const visitor = NgQueryResolveVisitor.resolve(sourceFile, program.getTypeChecker());
  const resolvedQueries = visitor.resolvedQueries;

  // Compute the query usage for all resolved queries.
  resolvedQueries.forEach(q => computeNgQueryUsage(q));
});
