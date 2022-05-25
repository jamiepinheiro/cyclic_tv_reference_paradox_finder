import { Reference } from "./Reference";

export interface Node {
    id: string;
    name: string;
}

export interface Link {
    source: string
    target: string
}

export interface GraphData {
    nodes: Node[];
    links: Link[];
}

