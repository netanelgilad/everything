import { dirname, resolve } from "path";
import { resolve as urlResolve } from "url";
import { assertThat } from "../../assertions/assertThat.ts";
import { is } from "../../assertions/is.ts";
import { closure } from "../../macros/closure.ts";
import { scenario } from "../../validator/scenario.ts";

export function resolveURIFromDependency(
  dependencyPath: string,
  currentURI: string
) {
  return dependencyPath.startsWith("http://")
    ? dependencyPath
    : dependencyPath.startsWith(".")
    ? currentURI.startsWith("/")
      ? resolve(dirname(currentURI), dependencyPath)
      : urlResolve(currentURI, dependencyPath)
    : dependencyPath;
}

export const Spec_resolveUIFromDependency = [
  scenario({
    description: "should support relative dependency from https dependency",
    verify: closure(async () => {
      assertThat(
        resolveURIFromDependency("./dep.ts", "https://some.dep/file.ts"),
        is("https://some.dep/dep.ts")
      );
    }),
  }),
];
