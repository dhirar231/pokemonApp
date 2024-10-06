import { Injectable } from '@angular/core';
import { PokemonService } from './pokemon.service';

@Injectable({
  providedIn: 'root',
})
export class BattleService {
  constructor(private pokemonService: PokemonService) {}

  // Function to simulate a battle between two teams
  battleTeams(team1: any[], team2: any[]): any {
    const result: {
      winner: string | null;
      rounds: Array<{
        round: number;
        team1Pokemon: string;
        team1DamageDealt: number;
        team2Pokemon: string;
        team2DamageDealt: number;
        team1Health: number;
        team2Health: number;
      }>;
    } = {
      winner: null,
      rounds: [],
    };

    let team1Health = team1.reduce((acc, pokemon) => acc + pokemon.life, 0);
    let team2Health = team2.reduce((acc, pokemon) => acc + pokemon.life, 0);

    let round = 1;

    while (team1Health > 0 && team2Health > 0) {
      const team1Pokemon = team1[round % team1.length];
      const team2Pokemon = team2[round % team2.length];

      const team1Attack = this.calculateDamage(team1Pokemon, team2Pokemon);
      const team2Attack = this.calculateDamage(team2Pokemon, team1Pokemon);

      team1Health -= team2Attack;
      team2Health -= team1Attack;

      result.rounds.push({
        round,
        team1Pokemon: team1Pokemon.name,
        team1DamageDealt: team1Attack,
        team2Pokemon: team2Pokemon.name,
        team2DamageDealt: team2Attack,
        team1Health,
        team2Health,
      });

      round++;
    }

    result.winner = team1Health > 0 ? 'Team 1' : 'Team 2';
    return result;
  }
  // Function to calculate damage based on type, power, etc.
  calculateDamage(attacker: any, defender: any): number {
    // Placeholder logic, you can make it more complex
    let damage = attacker.power;

    if (attacker.type === defender.weakness) {
      damage *= 1.5; // Increase damage if it's a type advantage
    }

    return Math.round(damage);
  }
}
