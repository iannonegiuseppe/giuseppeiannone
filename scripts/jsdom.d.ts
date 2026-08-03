// jsdom is already present in node_modules (a transitive dependency) but
// ships no type declarations and @types/jsdom isn't installed — this is a
// scripts/-only migration tool, not app code, so a minimal ambient `any`
// module declaration here is the pragmatic choice over adding a new
// dependency without naming it first.
declare module "jsdom";
