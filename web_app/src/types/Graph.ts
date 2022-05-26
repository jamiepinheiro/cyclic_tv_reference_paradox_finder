import { TvShow } from "./TvShow";

export type Graph = {
    tvShows: Map<string, TvShow>
    cycles: string[][]
}
