import * as ts from 'typescript';

export function createLanguageService(program: ts.Program, host: ts.CompilerHost): ts.LanguageService {
  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => Array.from(program.getRootFileNames()),
    getScriptVersion: () => '0', /* provide a static value as the scripts will never update. */
    getScriptSnapshot: fileName => ts.ScriptSnapshot.fromString(ts.sys.readFile(fileName)),
    getCurrentDirectory: () => host.getCurrentDirectory(),
    getCompilationSettings: () => program.getCompilerOptions(),
    getDefaultLibFileName: options => host.getDefaultLibFileName(options),
    fileExists: host.fileExists,
    readFile: host.readFile,
    readDirectory: host.readDirectory
  };

  return ts.createLanguageService(servicesHost);
}
