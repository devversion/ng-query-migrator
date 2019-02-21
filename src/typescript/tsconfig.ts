import {ParsedCommandLine} from "typescript";
import * as ts from "typescript";

export function parseTsconfigFile(tsconfigPath: string, basePath: string): ParsedCommandLine {
  const {config} = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const parseConfigHost = {
    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    fileExists: ts.sys.fileExists,
    readDirectory: ts.sys.readDirectory,
    readFile: ts.sys.readFile,
  };

  return ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, {});
}
