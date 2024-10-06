import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private apiUrl = 'http://localhost:5000/pokemons'; // Pokémon API URL
  private typesUrl = 'http://localhost:5000/pokemon_types'; // Pokémon types API URL
  private teamsUrl = 'http://localhost:5000/teams'; // Teams API URL

  constructor(private http: HttpClient) {}

  // Fetch all Pokémon
  getPokemons(): Observable<Pokemon[]> {
    return this.http.get<Pokemon[]>(this.apiUrl);
  }

  // Fetch Pokémon types
  getPokemonTypes(): Observable<PokemonType[]> {
    return this.http.get<PokemonType[]>(this.typesUrl);
  }

  // Update Pokémon information
  updatePokemon(id: string, pokemon: PokemonUpdate): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, pokemon);
  }

  // Add a new Pokémon
  addPokemon(pokemon: PokemonCreate): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, pokemon, { headers });
  }
  fetchTeamsWithPokemonsExcludingUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.teamsUrl}/with-pokemons/exclude/${userId}`
    );
  }
  // Fetch all teams
  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.teamsUrl);
  }

  // Add a new team
  addTeam(team: TeamCreate): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.teamsUrl, team, { headers });
  }
}

// Interfaces for Pokémon and Team data structures
export interface Pokemon {
  id: string;
  name: string;
  type: string; // Use 'type' to match your backend expectations
  power: number;
  life: number;
  image?: string;
}

export interface PokemonType {
  id: number;
  name: string;
}

export interface PokemonUpdate {
  name: string;
  type: string; // Ensure this matches backend expectations
  power: number;
  life: number;
  image?: string;
}

export interface PokemonCreate {
  name: string;
  type: string; // Ensure this key matches backend expectations
  power: number;
  life: number;
  image?: string;
}

export interface Team {
  id: string;
  userId: string;
  pokemonIds: string[];
}

export interface TeamCreate {
  userId: string;
  pokemonIds: string[];
}
