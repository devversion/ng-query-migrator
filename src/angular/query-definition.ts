import * as ts from 'typescript';
import {NgDecorator} from "./decorators";

export interface NgQueryDefinition {
  /** Property that declares the query. */
  property: ts.PropertyDeclaration;

  /** Decorator that declares this as a query. */
  decorator: NgDecorator;

  /** Class declaration that holds this query. */
  container: ts.ClassDeclaration;
}
