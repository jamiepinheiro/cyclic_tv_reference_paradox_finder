# Cyclic Tv Reference Paradox Finder

*Cyclic TV Reference Paradoxes* occur when a chain of TV show references contain a cycle.

> ie.
> 
> ![The Simpson's referenceing Rick and Morty, and Rick and Morty referencing The Simpson's](https://user-images.githubusercontent.com/13925440/171424139-e3c2a23c-e3f1-4913-88b3-d83fcc6f9f63.png)
> 
> Here, in the Simpsons' fictional universe, Rick and Morty exists as a TV show (shown by the reference). However, in the Rick and Morty fictional universe, The Simpsons also exist as a TV show. These two references create a cycle where each depends on the other being fictional which cannot be simultaneously true - a paradox!

This project finds these paradoxes through looking through subtitles files of popular TV shows. It is divided into two sections:

## Reference Gen Scripts
A set of python scripts to get the subtitles, and eventually output a CSV file of all TV show references found to be displayed in a web app.

| Script | Explanation |
| -----  | ----------- |
| get_top_tv_show_subtitles.py | Downloads subtitles of the top TV shows listed on [The Movie DB](https://www.themoviedb.org/). Be sure to set the `TMDB_API_KEY` environment variable to your API key. |
| index_srts.py | Indexes all subtitle files downloaded by `get_top_tv_show_subtitles.py` with [Woosh](https://github.com/mchaput/whoosh). |
| search_subtitles.py | Searches the index generated by `index_srts.py` for a keyword. |
| gen_output_data.py | Generates a graph of TV show references from the index generated by `index_srts.py` (and saves it to disk). Outputs a CSV of all references found in the index above as well a CSV of all TV shows used. |
| find_cycles_in_references.py | Runs a DFS on the graph outputed in `gen_output_data.py` to find cycles in references. |

## Web App
A react web app for visualizing the the graph generated by the *Reference Gen Scripts*. Run with `npm run start` to test locally.

![Screenshot of the web app showing references to/from the Simpsons](https://user-images.githubusercontent.com/13925440/171429498-fb549072-f1e3-4e5d-9a5d-d53f71a0e670.png)

![Screenshot of the web app showing a cycle of TV show references](https://user-images.githubusercontent.com/13925440/171429268-32ead231-f55b-4cc8-b695-e7a59e67606a.png)
