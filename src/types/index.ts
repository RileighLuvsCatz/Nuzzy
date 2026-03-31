export type Status = "Alive" | "Dead" | "Boxed";

export interface Encounter {
    id: string;
    pokemon: string;
    location: string;
    status: Status;
}

export interface Run {
    id: string
    name: string
    game: string
    createdAt: string
    encounters: Encounter[]
  }