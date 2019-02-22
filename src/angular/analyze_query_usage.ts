import * as ts from 'typescript';
import {NgQueryDefinition} from "./query-definition";
import {DerivedClassesMap} from "./ng_query_visitor";
import {DeclarationUsageVisitor} from "./declaration_usage_visitor";

/** Type of a given query. Either static or dynamic. */
export enum QueryType {STATIC, DYNAMIC}

/** Name of the on init Angular lifecycle hook. */
const STATIC_QUERY_LIFECYCLE_HOOKS = [
  'ngOnInit', 'ngAfterContentInit', 'ngAfterContentChecked'
];

export function analyzeNgQueryUsage(query: NgQueryDefinition,
                                    derivedClassesMap: DerivedClassesMap,
                                    typeChecker: ts.TypeChecker): QueryType {
  const classDecl = query.container;

  // List of classes that derive from the query container and need to be analyzed as well.
  // e.g. the ViewQuery could be used statically in the derived class.
  const derivedClasses = derivedClassesMap.get(classDecl);
  let isStatic = isQueryUsedStatically(classDecl, query, typeChecker);

  // We don't need to check the derived classes if the container class already
  // uses the query statically. This improves performances for a large chain of
  // derived classes.
  if (derivedClasses && !isStatic) {
    derivedClasses.forEach(derivedClass => {
      isStatic = isStatic || isQueryUsedStatically(derivedClass, query, typeChecker);
    });
  }

  return isStatic ? QueryType.STATIC : QueryType.DYNAMIC;
}

function isQueryUsedStatically(classDecl: ts.ClassDeclaration, query: NgQueryDefinition,
                               typeChecker: ts.TypeChecker): boolean {
  const staticQueryHooks = classDecl.members
    .filter(m => ts.isMethodDeclaration(m))
    .filter(m => (ts.isStringLiteral(m.name) || ts.isIdentifier(m.name) &&
        STATIC_QUERY_LIFECYCLE_HOOKS.includes(m.name.text)));

  // In case there is no are lifecycle hooks defined which could access a query statically,
  // we can consider the query as dynamic as nothing in the class declaration could properly
  // access the query in a static way.
  if (!staticQueryHooks.length) {
    return false;
  }

  const usageVisitor = new DeclarationUsageVisitor(query.property, typeChecker);
  let isStatic = false;

  // Visit each defined lifecycle hook and check for query usage.
  staticQueryHooks.forEach(hookDeclNode => {
    isStatic = isStatic || usageVisitor.isUsedInNode(hookDeclNode);
  });

  return isStatic;
}
