import os
import time
from constants import SUBTITLES_DIR, INDEX_DIR, INDEX_MARKER_DIR
import pysrt
from whoosh import index
from whoosh.fields import Schema, TEXT, STORED, ID


def get_index():
    if not os.path.exists(INDEX_MARKER_DIR):
        os.mkdir(INDEX_MARKER_DIR)

    # check if there is an existing index
    if os.path.exists(INDEX_DIR):
        return index.open_dir(INDEX_DIR)
    # no index, setup a new one
    else:
        os.mkdir(INDEX_DIR)

        schema = Schema(
            title=ID(stored=True),
            season=STORED,
            episode=STORED,
            text=TEXT(stored=True, phrase=True),
            start_time=STORED,
            end_time=STORED
        )
        return index.create_in(INDEX_DIR, schema)


def write_srt_to_index(ix, srt):
    print('Indexing %s' % srt)

    srt_file = '%s/%s' % (SUBTITLES_DIR, srt)

    # check if already added to index
    marker_file = '%s/%s' % (INDEX_MARKER_DIR, srt)
    if os.path.isfile(marker_file):
        return False

    srt_name_sections = srt.replace('.srt', '').split('_')
    subs = pysrt.open(srt_file, encoding='iso-8859-1')

    writer = ix.writer()
    for sub in subs:
        writer.add_document(
            title=srt_name_sections[0],
            season=srt_name_sections[1],
            episode=srt_name_sections[2],
            text=sub.text,
            start_time='%d:%d:%d,%d' % (
                sub.start.hours, sub.start.minutes, sub.start.seconds, sub.start.milliseconds),
            end_time='%d:%d:%d,%d' % (
                sub.end.hours, sub.end.minutes, sub.end.seconds, sub.end.milliseconds),
        )
    writer.commit()

    with open(marker_file, 'wb') as f:
        return True


def main():
    ix = get_index()

    while True:
        newFile = False
        for file in os.listdir(SUBTITLES_DIR):
            if '.srt' in file:
                updated = write_srt_to_index(ix, file)
                newFile = newFile or updated

        if not newFile:
            print('No new files, sleeping...')
            time.sleep(60)


if __name__ == "__main__":
    main()
