import os
import jsonpickle
from constants import SUBTITLES_DIR, INDEX_DIR, REFERENCE_GRAPH, TV_SHOW_DENYLIST
from whoosh import index
from whoosh.qparser import QueryParser, query

class Reference:
    def __init__(self, title, season, episode, text, start_time, end_time, score):
        self.title = title
        self.season = season
        self.episode = episode
        self.text = text
        self.start_time = start_time
        self.end_time = end_time
        self.score = score

class Node:
    def __init__(self, title):
        self.title = title
        self.references = []

class Graph:
    def __init__(self):
        # create a node for each media item
        self.nodes = {}
        for file in os.listdir(SUBTITLES_DIR):
            if '.srt' in file:
                title = file.split('_')[0]
                self.nodes[title] = Node(title)
        
    def find_references(self):
        ix = index.open_dir(INDEX_DIR)
        qp = QueryParser('text', schema=ix.schema)
        for title, node in self.nodes.items():
            if title in TV_SHOW_DENYLIST:
                continue 
            print('Finding references for %s' % title)
            q = qp.parse('"%s"' % title)

            # media cannot reference itself
            restrict_q = query.Term('title', title)

            with ix.searcher() as searcher:
                results = searcher.search(q, limit=None, mask=restrict_q)
                for r in results:
                    node.references.append(Reference(r['title'], r['season'], r['episode'], r['text'], r['start_time'], r['end_time'], r.score))

            print(len(node.references))

def main():
    g = Graph()
    g.find_references()
    with open(REFERENCE_GRAPH, 'w') as f:
        f.write(jsonpickle.encode(g))
main()
