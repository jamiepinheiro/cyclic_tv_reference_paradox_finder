import { TvShow } from "../types/TvShow";

type Props = {
  tvShowSelected: TvShow | null;
};

function Selected({ tvShowSelected }: Props) {
  return <div>{JSON.stringify(tvShowSelected)}</div>;
}

export default Selected;
