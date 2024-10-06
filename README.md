# Pokémon Battle Application

This **Pokémon Battle Application** allows users to manage their favorite Pokémon, build teams, and simulate exciting battles between two teams of six Pokémon. The app is built using Angular for the frontend and Node.js for the backend, with Supabase as the database solution. Users can also list, adjust, and simulate battles with their favorite Pokémon teams.

## Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [Usage](#usage)
5. [API Endpoints](#api-endpoints)
6. [Database Structure](#database-structure)
7. [Future Enhancements](#future-enhancements)
8. [Contributing](#contributing)


---

## Features

- **List Pokémon**: View all available Pokémon with details such as name, type, power, and life.
- **Build Teams**: Create a team of six Pokémon, allowing the same Pokémon to be repeated.
- **Battle Simulation**: Simulate a round-by-round battle between two teams of six Pokémon.
- **Type Factor**: Battle rules take Pokémon types into account, affecting power during fights.
- **User Authentication**: Users can log in and manage their own Pokémon teams.
- **Responsive Design**: The app is responsive and adapts to different screen sizes.

---

## Technologies Used

- **Frontend**: Angular, TypeScript, Bootstrap
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Authentication
- **Battle Simulation Logic**: TypeScript

---

## Installation

### Prerequisites

- Node.js (v14+)
- Angular CLI
- Supabase account
- Git

### Steps

1. Clone the repository:

```bash
git clone https://github.com/your-username/pokemonApp.git
cd pokemonApp
```

2. Install dependencies:

```bash
npm install
```

3. Set up Supabase:

   - Sign up at Supabase.
   - Create a project and set up the required tables for Pokémon, teams, and battles.
   - Configure environment variables for Supabase:
     - Add your Supabase URL and public API key to the `src/environments/environment.ts` file.

4. Start the development server:

```bash
ng serve
```

5. Run the backend:

```bash
cd backend
node server.js
```

6. Navigate to the app:
   - Open [http://localhost:4200](http://localhost:4200) in your browser.

---

## Usage

1. **Sign Up/Log In**: Create an account or log in with an existing account.
2. **Build Your Team**: Select your favorite Pokémon and build a team of six.
3. **Simulate Battles**: Choose an enemy team and initiate a battle. Watch as the battle unfolds round by round with results based on the types and power of each Pokémon.
4. **Manage Your Teams**: Add, edit, or remove Pokémon from your teams as you like.

---
## PostgreSQL

CREATE OR REPLACE FUNCTION insert_team(
    p_user_id UUID,
    p_team_name TEXT,
    p_pokemon_ids UUID[]
) RETURNS UUID AS $$
DECLARE
    team_id UUID;
BEGIN
    -- Ensure exactly 6 Pokémon are provided
    IF array_length(p_pokemon_ids, 1) != 6 THEN
        RAISE EXCEPTION 'Exactly 6 Pokémon must be provided.';
    END IF;
    -- Insert the team into the team table
    INSERT INTO public.team (user_id, team_name)
    VALUES (p_user_id, p_team_name)
    RETURNING id INTO team_id;
    -- Insert Pokémon into the team_pokemon table
    INSERT INTO public.team_pokemon (team_id, pokemon_id, slot_number)
    SELECT team_id, unnest(p_pokemon_ids), generate_series(1, 6);
    RETURN team_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_teams_ordered_by_power()
RETURNS TABLE(team_id UUID, team_name TEXT, total_power INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id AS team_id,
        t.team_name,
        COALESCE(SUM(p.power), 0) AS total_power
    FROM 
        public.team t
    LEFT JOIN 
        public.team_pokemon tp ON t.id = tp.team_id
    LEFT JOIN 
        pokemon p ON tp.pokemon_id = p.id
    GROUP BY 
        t.id, t.team_name
    ORDER BY 
        total_power DESC;
END;
$$ LANGUAGE plpgsql;




## API Endpoints

### Frontend (Angular)

- `/teams`: Displays a list of the user's Pokémon teams.
- `/battle`: Initiates the battle simulation between two teams.
- `/pokemons`: Lists all available Pokémon with details.

### Backend (Node.js)

- `POST /teams`: Create a new team.
- `GET /teams`: Get all teams.
- `POST /battle`: Simulate a battle between two teams.

---

## Database Structure

- **Pokémon Table**: Stores Pokémon details such as name, type, power, and life.
- **Teams Table**: Stores teams with a reference to their Pokémon.

---

## Future Enhancements

- **Battle History**: Allow users to view previous battles and outcomes.
- **Trading**: Enable users to trade Pokémon between teams.
- **Improved Battle Logic**: Introduce more complex battle mechanics and strategy.

---

## Contributing

Feel free to fork this repository, submit issues, and make pull requests. Contributions are welcome!

---
