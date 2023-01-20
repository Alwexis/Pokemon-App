export interface Pokemon {
    id: number;
    name: string;
    types: string[];
    image: string;
    sound: string;
    description: string;
    height: number;
    weight: number;
}

export interface PokemonLess {
    id: number;
    name: string;
    types: string[];
    image: string;
    generation: number;
}

export interface PokemonCache {
    [key: number]: Pokemon;
}