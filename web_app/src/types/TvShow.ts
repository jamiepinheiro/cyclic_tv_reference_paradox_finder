import { Reference } from "./Reference";
import { Node } from "./GraphData"
export interface TvShow {
    title: string;
    referencesTo: Map<string, Reference[]>;
    referencedBy: Map<string, Reference[]>;
    node: Node
}
