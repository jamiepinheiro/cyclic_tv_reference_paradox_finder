import { Reference } from "./Reference";
import { Node } from "./GraphData";

export type TvShow = {
  title: string;
  referencesTo: Map<string, Reference[]>;
  referencedBy: Map<string, Reference[]>;
};
