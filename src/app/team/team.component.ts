// team.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
})
export class TeamComponent implements OnInit {
  pokemons: any[] = []; // Array to hold Pokémon data

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchPokemons(); // Fetch Pokémon data on component initialization
  }

  fetchPokemons() {
    this.http.get('/pokemons').subscribe((data: any) => {
      this.pokemons = data; // Populate the pokemons array with data
    });
  }

  addTeam() {
    const selectedPokemonIds = this.pokemons
      .filter((pokemon) => pokemon.selected) // Filter selected Pokémon
      .map((pokemon) => pokemon.id); // Extract their IDs

    if (selectedPokemonIds.length !== 6) {
      alert('Please select exactly 6 Pokémon.');
      return; // Ensure exactly 6 Pokémon are selected
    }

    const teamData = {
      userId: 'user-id', // Replace with actual user ID
      pokemonIds: selectedPokemonIds,
    };

    this.http.post('/teams', teamData).subscribe(
      (response) => {
        console.log('Team added successfully:', response);
        alert('Team added successfully!');
      },
      (error) => {
        console.error('Error adding team:', error);
        alert('Error adding team. Please try again.');
      }
    );
  }
}
