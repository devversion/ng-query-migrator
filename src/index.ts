import * as ts from 'typescript';
import {dirname, join} from 'path';
import {parseTsconfigFile} from "./typescript/tsconfig";
import {createLanguageService} from "./typescript/language-service";
import {QueryAstVisitor} from "./visitor";

const configPath = join(__dirname, '../test-fixture/tsconfig.json');

const parsed = parseTsconfigFile(configPath, dirname(configPath));
const host = ts.createCompilerHost(parsed.options, true);
const program = ts.createProgram(parsed.fileNames, parsed.options, host);
const languageService = createLanguageService(program, host);

program.getRootFileNames().forEach(rootFileName => {
  const sourceFile = program.getSourceFile(rootFileName);
  const visitor = new QueryAstVisitor(program.getTypeChecker());

  visitor.visitNode(sourceFile);
});
