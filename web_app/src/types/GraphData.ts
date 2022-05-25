export interface Node {
    id: string;
}

export interface Link {
    source: string
    target: string
}

export interface GraphData {
    nodes: Node[];
    links: Link[];
}

