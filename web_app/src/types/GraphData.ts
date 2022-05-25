export type Node = {
    id: string;
}

export type Link = {
    source: string
    target: string
}

export type GraphData = {
    nodes: Node[];
    links: Link[];
}

