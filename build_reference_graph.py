import sys
from whoosh import index
from whoosh.qparser import QueryParser, query

INDEX_DIR = 'index'

def main():
    ix = index.open_dir(INDEX_DIR)
    qp = QueryParser('text', schema=ix.schema)
    q = qp.parse(sys.argv[1])
    restrict_q = query.Term('title', sys.argv[1])

    with ix.searcher() as searcher:
        results = searcher.search(q, limit=None, mask=restrict_q)
        for result in results:
            print(result)

main()
