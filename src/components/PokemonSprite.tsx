import { useEffect, useState } from "react";
import { getSpriteUrl } from "../lib/pokemonSprites";
import { speciesReference } from "../lib/gameReference";
interface Props {
  species: string;
  size?: number;
  className?: string;
}
export default function PokemonSprite(props: Props) {
  return <Sprite key={props.species} {...props} />;
}
function Sprite({ species, size = 40, className = "" }: Props) {
  const known = speciesReference(species);
  const [url, setUrl] = useState<string | null>(
    known
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${known.id}.png`
      : null,
  );
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (known || !species) return;
    let cancelled = false;
    getSpriteUrl(species).then((resolved) => {
      if (!cancelled) {
        setUrl(resolved);
        setFailed(!resolved);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [known, species]);
  if (!url || failed)
    return (
      <span
        className={`sprite-placeholder ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {failed ? "?" : "·"}
      </span>
    );
  return (
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`shrink-0 [image-rendering:pixelated] ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
