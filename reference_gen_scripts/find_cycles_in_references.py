import csv
from constants import REFERENCES_CSV
from gen_references import Reference, Graph


def main():
    g = Graph()
    with open(REFERENCES_CSV, 'r') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if i == 0:
                continue
            r = Reference(*row)
            g.nodes[r.reference_title].references.append(r)

    def DFS(node, visited):
        if node.references:
            for r in node.references:
                cycle = r.title in [v.reference_title for v in visited]
                visited.append(r)
                if not cycle:
                    DFS(g.nodes[r.title], visited)
                else:
                    print('___')
                    for i, v in enumerate(reversed(visited)):
                        if i != 0 and v.title == r.title:
                            break
                        print("\t{: >20} {: >3}{: >3} {: >20}:\t{text}".format(
                            v.title, v.season, v.episode, v.start_time, text=v.text))
                visited.pop(-1)

    for n in g.nodes.values():
        DFS(n, [])


if __name__ == "__main__":
    main()
