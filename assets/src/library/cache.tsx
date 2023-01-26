import { LibraryPeersState } from "./types";
import isEqual from "lodash.isequal";

export const cache = <T,>(
  callbackFunction: (snapshot: LibraryPeersState | null) => T
): ((snapshot: LibraryPeersState | null) => T) => {
  // console.log("%c Create cache", "color: orange");
  let cache: any = undefined;

  return (innerSnapshot) => {
    const result = callbackFunction(innerSnapshot);

    if (isEqual(cache, result)) {
      // console.log("%c Return cache", "color: green");
      return cache;
    }
    // console.log("%c Return new", "color: red");

    cache = result;

    return cache;
  };
};
