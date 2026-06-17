import os
import jsonpickle
import csv
from constants import SUBTITLES_DIR, INDEX_DIR, REFERENCE_GRAPH, REFERENCES_CSV, REFERENCES_DENYLIST_CSV, UNIVERSES, TV_SHOWS_CSV
from whoosh import index
from whoosh.qparser import QueryParser, query
import llm_reference_check


def getTitles():
    titles = set()
    for file in os.listdir(SUBTITLES_DIR):
        if '.srt' in file:
            title = file.split('_')[0]
            titles.add(title)

    return titles


class Reference:
    def __init__(self, reference_title, title, season, episode, text, start_time, end_time):
        self.reference_title = reference_title
        self.title = title
        self.season = season
        self.episode = episode
        self.text = text.replace('"', '')
        self.start_time = start_time
        self.end_time = end_time

    def __eq__(self, other):
        if not isinstance(other, Reference):
            return False
        else:
            return (
                self.reference_title == other.reference_title and
                self.title == other.title and
                self.season == other.season and
                self.episode == other.episode and
                self.text == other.text and
                self.start_time == other.start_time and
                self.end_time == other.end_time
            )

    def __hash__(self):
        return hash(''.join(self.to_csv_row()))

    CSV_HEADER = ['reference_title', 'title', 'season',
                  'episode', 'text', 'start_time', 'end_time']

    def to_csv_row(self):
        return [
            self.reference_title,
            self.title,
            self.season,
            self.episode,
            self.text,
            self.start_time,
            self.end_time,
        ]

    def is_intrauniverse_reference(self):
        for universe in UNIVERSES:
            if self.title in universe and self.reference_title in universe:
                return True
        return False


class Node:
    def __init__(self, title):
        self.title = title
        self.references = []


class Graph:
    def __init__(self):
        # create a node for each media item
        self.nodes = {}
        for title in getTitles():
            self.nodes[title] = Node(title)

    def find_references(self):
        ix = index.open_dir(INDEX_DIR)
        qp = QueryParser('text', schema=ix.schema)

        for title, node in self.nodes.items():
            # Note: we intentionally no longer skip 'too common' show names
            # (the old TV_SHOW_DENYLIST). Instead, candidate references are
            # validated by an LLM in write_references_to_csv, which can tell
            # an actual TV-show reference from coincidental wording.
            print('Finding references for %s' % title)
            q = qp.parse('"%s"' % title)

            # media cannot reference itself
            restrict_q = query.Term('title', title)

            with ix.searcher() as searcher:
                results = searcher.search(q, limit=None, mask=restrict_q)
                for r in results:
                    reference = Reference(
                        title, r['title'], r['season'], r['episode'], r['text'], r['start_time'], r['end_time'])
                    node.references.append(reference)

            print(len(node.references))

    def write_references_to_csv(self):
        reference_denylist = set()
        with open(REFERENCES_DENYLIST_CSV, 'r') as f:
            reader = csv.reader(f)
            for row in reader:
                reference_denylist.add(Reference(*row))

        # Gather candidate references, applying the cheap structural filters
        # first (intra-universe / manual denylist). The 'too common show name'
        # filtering is no longer done by a hand-maintained list; instead an LLM
        # decides whether each candidate is a genuine TV-show reference.
        candidates = []
        for n in self.nodes.values():
            for r in n.references:
                if not r.is_intrauniverse_reference() and r not in reference_denylist:
                    candidates.append(r)

        print('Validating %d candidate references with the LLM...' % len(candidates))

        def progress(done, total):
            print('  LLM validated %d/%d candidates' % (done, total))

        kept = llm_reference_check.filter_references(candidates, on_progress=progress)
        print('Kept %d of %d references after LLM validation' % (len(kept), len(candidates)))

        with open(REFERENCES_CSV, 'w') as f:
            writer = csv.writer(f)
            writer.writerow(Reference.CSV_HEADER)
            for r in kept:
                writer.writerow(r.to_csv_row())

    def write_shows_to_csv(self):
        tvShows = set()

        with open(TV_SHOWS_CSV, 'w') as f:
            writer = csv.writer(f)
            writer.writerow(['title'])
            for title in sorted(getTitles()):
                writer.writerow([title])


def main():
    g = None
    if not os.path.exists(REFERENCE_GRAPH):
        g = Graph()
        g.find_references()

        with open(REFERENCE_GRAPH, 'w') as f:
            f.write(jsonpickle.encode(g, indent=4))
    else:
        with open(REFERENCE_GRAPH, 'r') as f:
            g = jsonpickle.decode(f.read())

    g.write_references_to_csv()
    g.write_shows_to_csv()


if __name__ == "__main__":
    main()
