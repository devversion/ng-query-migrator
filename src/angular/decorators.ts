import * as ts from 'typescript';
import {getCallDecoratorImport} from "../typescript/decorators";

export interface NgDecorator {
  name: string;
  node: ts.Decorator;
}

export function getAngularDecorators(typeChecker: ts.TypeChecker, decorators: ReadonlyArray<ts.Decorator>)
    : NgDecorator[] {
  return decorators
    .map(node => ({node, importData: getCallDecoratorImport(typeChecker, node)}))
    .filter(({importData}) => importData && importData.importModule.startsWith('@angular/'))
    .map(({node, importData}) => ({node, name: importData.name}))
}
