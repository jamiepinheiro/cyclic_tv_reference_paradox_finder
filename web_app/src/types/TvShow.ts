import { Reference } from "./Reference";

export interface TvShow {
    title: string;
    referencesTo: Map<string, Reference[]>;
    referencedBy: Map<string, Reference[]>;
}
