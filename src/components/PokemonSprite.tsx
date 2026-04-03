import { useEffect, useState } from "react";
import { getSpriteUrl } from "../lib/pokemonSprites";

interface Props {
  species: string;
  size?: number;
  className?: string;
}

export default function PokemonSprite({
  species,
  size = 40,
  className = "",
}: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    setFailed(false);

    getSpriteUrl(species).then((resolved) => {
      if (cancelled) return;
      if (resolved) setUrl(resolved);
      else setFailed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [species]);

  const box = `shrink-0 flex items-center justify-center ${className}`;

  if (!url && !failed) {
    return (
      <span
        className={`${box} animate-pulse rounded bg-gray-800`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (failed || !url) {
    return (
      <span
        className={`${box} rounded bg-gray-800 text-gray-600 text-xs select-none`}
        style={{ width: size, height: size }}
        title={species}
      >
        ?
      </span>
    );
  }

  return (
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`${box} [image-rendering:pixelated]`}
      onError={() => setFailed(true)}
    />
  );
}
