import { Component, OnInit } from '@angular/core';
import { PokemonService } from './pokemon.service';
import { AuthService } from './auth.service'; // Import the AuthService
import { BattleService } from './battle.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  pokemons: any[] = []; // Array to hold Pokémon data
  teams: any[] = []; // Array to hold team data
  types: any[] = []; // Array to hold Pokémon types
  newPokemon: any = {
    name: '',
    type: '', // Change typeId to type
    power: 10,
    life: 50,
    image: '',
  };
  battleResult: any = null;
  isBattling: boolean = false;
  selectedPokemonIds: string[] = []; // Array to hold selected Pokémon IDs
  enemyteamsWithPokemons: any[] = [];
  showConfirmationModal: boolean = false; // Flag to show/hide confirmation modal
  isFormValid: boolean = false; // Flag to indicate form validity
  userId: string = ''; // Store dynamic user ID
  teamName: string = ''; // Property to hold team name
  isAuthenticated: boolean = false;
  constructor(
    private pokemonService: PokemonService,
    private authService: AuthService // private battleService: BattleService
  ) {}

  ngOnInit(): void {
    this.loadPokemons();
    this.loadTeams();
    this.loadPokemonTypes();
    this.getUserId();
    this.checkAuthStatus(); // Check if user is logged in
  }
  async checkAuthStatus(): Promise<void> {
    const currentUser = await this.authService.getCurrentUser();
    this.isAuthenticated = currentUser !== null;
  }

  async openSignUp() {
    const { value: formValues } = await Swal.fire({
      title: 'Sign Up',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Email">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Password" type="password">',
      focusConfirm: false,
      preConfirm: () => {
        const email = (
          document.getElementById('swal-input1') as HTMLInputElement
        ).value;
        const password = (
          document.getElementById('swal-input2') as HTMLInputElement
        ).value;

        // Only check if email and password fields are not empty
        if (!email || !password) {
          Swal.showValidationMessage('Both email and password are required.');
          return false;
        }

        // Return form values
        return { email, password };
      },
    });

    if (formValues) {
      const { email, password } = formValues;
      try {
        // Try to sign up with the email and password provided
        const { user, error } = await this.authService.signUp(email, password);
        if (user) {
          Swal.fire('Success', 'Sign up successful!', 'success');
          this.isAuthenticated = true;
        } else if (error) {
          Swal.fire('Error', error.message, 'error');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'An unexpected error occurred.', 'error');
      }
    }
  }

  async openSignIn() {
    const { value: formValues } = await Swal.fire({
      title: 'Sign In',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Email">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Password" type="password">',
      focusConfirm: false,
      preConfirm: () => {
        const email = (
          document.getElementById('swal-input1') as HTMLInputElement
        ).value;
        const password = (
          document.getElementById('swal-input2') as HTMLInputElement
        ).value;
        if (!email || !password) {
          Swal.showValidationMessage('Both email and password are required.');
        }
        return { email, password };
      },
    });

    if (formValues) {
      const { email, password } = formValues;
      try {
        const { user, error } = await this.authService.signIn(email, password);
        if (user) {
          Swal.fire('Success', 'Sign in successful!', 'success');
          this.isAuthenticated = true;
        } else if (error) {
          Swal.fire('Error', error.message, 'error');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'An unexpected error occurred.', 'error');
      }
    }
  }

  async signOut() {
    try {
      const { error } = await this.authService.signOut();
      if (!error) {
        Swal.fire(
          'Signed Out',
          'You have been signed out successfully',
          'success'
        );
        this.isAuthenticated = false;
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'An unexpected error occurred.', 'error');
    }
  }

  loadPokemons(): void {
    this.pokemonService.getPokemons().subscribe(
      (data) => {
        this.pokemons = data;
      },
      (error) => {
        console.error('Error loading Pokémons:', error);
        alert('Error loading Pokémons. Please try again.');
      }
    );
  }

  async loadTeams(): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser(); // Fetch the current user
      const userId = user ? user.id : ''; // Get the user ID
      if (!userId) {
        throw new Error('User is not authenticated.');
      }

      const token = await this.authService.getAuthToken(); // Retrieve the authentication token
      console.log('User ID:', userId); // Debug: Log user ID
      console.log('Auth Token:', token); // Debug: Log token

      const response = await fetch(`http://localhost:5000/teams/${userId}`, {
        // Include userId in the URL
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });

      if (!response.ok) {
        const errorData = await response.json(); // Get error details from response
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json(); // Parse the response data

      console.log('Teams Data:', data); // Log the data for debugging
      this.teams = data; // Assign the retrieved teams to the local variable
    } catch (error) {
      console.error('Error loading teams:', error);
      alert('Error loading teams. Please try again.');
    }
  }

  viewTeamDetails(teamId: string) {}
  loadPokemonTypes(): void {
    this.pokemonService.getPokemonTypes().subscribe(
      (data) => {
        this.types = data;
      },
      (error) => {
        console.error('Error loading Pokémon types:', error);
        alert('Error loading Pokémon types. Please try again.');
      }
    );
  }

  async getUserId(): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser(); // Fetch the current user
      this.userId = user ? user.id : '';

      // if (this.userId) {
      //   console.log('User ID:', this.userId); // Log the user ID
      // } else {
      //   console.log('No user is logged in, user ID is not available.');
      // }
    } catch (err) {
      console.error('Error fetching user ID:', err);
    }
  }

  updatePokemon(pokemon: any): void {
    this.pokemonService.updatePokemon(pokemon.id, pokemon).subscribe(
      () => {
        alert('Pokémon updated!');
        this.loadPokemons(); // Refresh Pokémon list after update
      },
      (error) => {
        console.error('Error updating Pokémon:', error);
        alert('Error updating Pokémon. Please try again.');
      }
    );
  }

  selectPokemon(pokemonId: string): void {
    if (this.selectedPokemonIds.includes(pokemonId)) {
      this.selectedPokemonIds = this.selectedPokemonIds.filter(
        (id) => id !== pokemonId
      );
    } else {
      if (this.selectedPokemonIds.length < 6) {
        this.selectedPokemonIds.push(pokemonId);
      } else {
        alert('You can only select up to 6 Pokémon.');
      }
    }
    this.checkFormValidity();
  }

  addPokemon(): void {
    const requestBody = {
      name: this.newPokemon.name,
      type: this.newPokemon.type, // Use type
      power: this.newPokemon.power,
      life: this.newPokemon.life,
      image: this.newPokemon.image,
    };

    this.pokemonService.addPokemon(requestBody).subscribe(
      (response) => {
        alert('Pokémon added successfully!');
        this.loadPokemons(); // Refresh Pokémon list
        this.resetNewPokemon(); // Reset the form
      },
      (error) => {
        console.error('Error adding Pokémon:', error);
        alert('Error adding Pokémon. Please try again.');
      }
    );
  }

  resetNewPokemon(): void {
    this.newPokemon = {
      name: '',
      type: '', // Use type
      power: 10,
      life: 50,
      image: '',
    }; // Reset form fields
  }

  openConfirmationModal() {
    Swal.fire({
      title: 'Confirm Team Addition',
      text: 'Are you sure you want to add the following team?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      html: `
        <div>
          <label for="teamNameInput">Team Name:</label>
          <input type="text" id="teamNameInput" class="swal2-input" placeholder="Enter team name" value="${
            this.teamName
          }" />
        </div>
        <ul>
          ${this.selectedPokemonIds
            .map((id) => `<li>${this.getPokemonNameById(id)}</li>`)
            .join('')}
        </ul>
      `,
      preConfirm: () => {
        const teamNameInput = Swal.getPopup()?.querySelector(
          '#teamNameInput'
        ) as HTMLInputElement;
        if (!teamNameInput || !teamNameInput.value) {
          Swal.showValidationMessage('Please enter a team name');
          return false;
        } else {
          return teamNameInput.value;
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const teamName = result.value;
        this.confirmAddTeam(teamName);
      }
    });
  }

  async confirmAddTeam(teamName: string): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser(); // Fetch the current user
      const userId = user ? user.id : ''; // Get the user ID

      const teamData = {
        teamName: teamName, // Include the team name
        pokemonIds: this.selectedPokemonIds, // Pokémon IDs selected by the user
        userId: userId, // Include the user ID
      };

      // Retrieve the authentication token
      const token = await this.authService.getAuthToken();

      // Make the API request to add the team
      const response = await fetch('http://localhost:5000/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify(teamData), // Send the team data as JSON
      });

      if (!response.ok) {
        const errorData = await response.json(); // Get error details from response
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json(); // Parse the response data

      // Handle the response from the server
      if (data.error) {
        console.error(data.error);
        Swal.fire('Error', data.error, 'error'); // Show error using Swal
      } else {
        Swal.fire('Success', 'Team added successfully!', 'success'); // Show success message
        this.selectedPokemonIds = []; // Clear selected Pokémon after adding the team
        this.loadTeams(); // Refresh the team list
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Swal.fire('Error', 'An unexpected error occurred.', 'error'); // Show unexpected error
    }
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false; // Hide the modal
  }

  getPokemonNameById(id: string): string {
    const pokemon = this.pokemons.find((p) => p.id === id);
    return pokemon ? pokemon.name : 'Unknown Pokémon';
  }

  getPokemonById(id: string): any {
    return this.pokemons.find((p) => p.id === id);
  }

  checkFormValidity(): void {
    // Form is valid if exactly 6 Pokémon are selected
    this.isFormValid = this.selectedPokemonIds.length === 6;
  }
  initiateBattle(myteam: any): void {
    // Show loading indicator (optional, implement based on your UI framework)
    console.log(myteam);
    this.pokemonService
      .fetchTeamsWithPokemonsExcludingUser(this.userId)
      .subscribe(
        (teams) => {
          console.log('Fetched enemy teams:', teams);
          this.enemyteamsWithPokemons = teams;
          console.log(this.enemyteamsWithPokemons);
          const teamsMap = this.groupPokemonsByTeam(teams);
          const enemyTeamsMessage = this.formatEnemyTeamsMessage(teamsMap);

          // Close the loading alert
          Swal.close();

          // Create a dynamic HTML string for team selection
          const teamSelectionHtml = `
            <div>
              <p>Select an enemy team to battle:</p>
              ${Array.from(teamsMap.entries())
                .map(
                  ([teamId, team]) => `
                    <div>
                      <input type="radio" id="${teamId}" name="enemyTeam" value="${teamId}">
                      <label for="${teamId}">${
                    team.team_name
                  }: ${team.pokemons.join(', ')}</label>
                    </div>
                  `
                )
                .join('')}
            </div>
          `;

          // Display enemy teams with selection options
          Swal.fire({
            title: 'Enemy Teams',
            html: teamSelectionHtml,
            icon: 'info',
            confirmButtonText: 'Start Battle',
            customClass: {
              popup: 'my-swal-popup', // Add custom class for further styling
            },
            preConfirm: () => {
              const selectedTeamId = document.querySelector(
                'input[name="enemyTeam"]:checked'
              ) as HTMLInputElement;
              if (!selectedTeamId) {
                Swal.showValidationMessage(
                  'You must select an enemy team to battle!'
                );
                return false;
              }
              return selectedTeamId.value; // Return the selected team ID
            },
          }).then((result) => {
            if (result.isConfirmed) {
              const enemyTeamId = result.value; // Get the selected enemy team ID

              this.startBattle(myteam, enemyTeamId); // Start the battle with selected teams
            }
          });
        },
        (error) => {
          console.error('Error fetching teams:', error);
          Swal.close();

          // Display error message with retry option
          Swal.fire({
            title: 'Error!',
            text: 'Could not load enemy teams. Please try again later.',
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: 'Retry',
            cancelButtonText: 'Close',
          }).then((result) => {
            if (result.isConfirmed) {
              this.initiateBattle(myteam); // Retry fetching enemy teams
            }
          });
        }
      );
  }

  startBattle(myteam: any, enemyTeam: any): void {
    const tenemyTeam = JSON.parse(enemyTeam);

    console.log('enemy 11 : ' + tenemyTeam);
    const myPokemons = myteam.pokemons;
    if (!myPokemons || !Array.isArray(myPokemons)) {
      console.error('Your team has no Pokémon.');
      Swal.fire({
        title: 'Error!',
        text: 'Your team has no Pokémon to battle with.',
        icon: 'error',
        confirmButtonText: 'Close',
      });
      return;
    }

    let myTeamIndex = 0;
    let enemyTeamIndex = 0;

    // Simulate the battle round by round
    const battleRound = () => {
      if (
        myTeamIndex < myPokemons.length &&
        enemyTeamIndex < enemyTeam.pokemons.length
      ) {
        const myPokemon = myPokemons[myTeamIndex].pokemon_id;
        const enemyPokemon = enemyTeam.pokemons[enemyTeamIndex];
        // Display current Pokémon status before the round
        Swal.fire({
          title: 'Battle Round',
          text: `${myPokemon.name} (Life: ${myPokemon.life}) vs ${enemyPokemon.name} (Life: ${enemyPokemon.life})`,
          icon: 'info',
          showConfirmButton: false,
          timer: 2000,
        });

        // Calculate remaining life after the round
        const myPokemonFactor = this.getTypeFactor(
          myPokemon.type,
          enemyPokemon.type
        );
        const enemyPokemonFactor = this.getTypeFactor(
          enemyPokemon.type,
          myPokemon.type
        );

        // Update life values based on the battle rules
        enemyPokemon.life -= myPokemon.power * myPokemonFactor;
        myPokemon.life -= enemyPokemon.power * enemyPokemonFactor;

        // Check if any Pokémon has fainted
        if (enemyPokemon.life <= 0) {
          enemyTeamIndex++;
        } else if (myPokemon.life <= 0) {
          myTeamIndex++;
        }

        // Wait for a short duration before the next round
        setTimeout(battleRound, 2500); // Delay for 2.5 seconds before the next round
      } else {
        // Determine the winner
        let winner: string;
        if (myTeamIndex < myPokemons.length) {
          winner = 'Your team wins!';
        } else if (enemyTeamIndex < enemyTeam.pokemons.length) {
          winner = 'Enemy team wins!';
        } else {
          winner = "It's a tie!";
        }

        // Display the winner
        Swal.fire({
          title: 'Battle Result',
          text: winner,
          icon: 'success',
          confirmButtonText: 'Close',
        });
      }
    };

    // Start the battle
    battleRound();
  }

  // Helper method to determine the type factor
  private getTypeFactor(attackType: string, defenseType: string): number {
    // Implement type effectiveness logic based on your game rules
    const typeEffectiveness: { [key: string]: { [key: string]: number } } = {
      fire: { water: 0.5, grass: 2, fire: 1 },
      water: { fire: 2, grass: 0.5, water: 1 },
      grass: { fire: 0.5, water: 2, grass: 1 },
      // Add other types as necessary
    };

    return typeEffectiveness[attackType]?.[defenseType] || 1; // Default factor is 1
  }
  // Helper method to group Pokémon by team ID
  private groupPokemonsByTeam(
    teams: any[]
  ): Map<string, { team_name: string; pokemons: string[] }> {
    const teamsMap = new Map<
      string,
      { team_name: string; pokemons: string[] }
    >();
    teams.forEach((enemy) => {
      const { team_id, team_name, pokemon_name } = enemy;
      if (!teamsMap.has(team_id)) {
        teamsMap.set(team_id, { team_name, pokemons: [] });
      }
      teamsMap.get(team_id)?.pokemons.push(pokemon_name);
    });
    return teamsMap;
  }

  // Helper method to format the message for SweetAlert
  private formatEnemyTeamsMessage(
    teamsMap: Map<string, { team_name: string; pokemons: string[] }>
  ): string {
    return Array.from(teamsMap.values())
      .map((team) => {
        const pokemons = team.pokemons.join(', ');
        return `${team.team_name}: ${pokemons}`;
      })
      .join('<br>');
  }

  // Method to display all enemy teams

  // Auth Methods
  get isLoggedIn(): boolean {
    console.log(this.authService.getCurrentUser());
    return !!this.authService.getCurrentUser(); // Check if user is logged in
  }

  async logOut(): Promise<void> {
    await this.authService.signOut();
    // Optionally, you can add a redirect or message here after logout
  }
}
