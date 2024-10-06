// backend/index.js
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(cors());
app.use(express.json());

// Route to get all pokemons
app.get("/pokemons", async (req, res) => {
  const { data: pokemons, error } = await supabase.from("pokemon").select(`
      id, 
      name,
      image, 
      power, 
      life, 
      type (name)
    `);

  if (error) return res.status(400).json({ error: error.message });
  res.json(pokemons);
});

// Route to add a new Pokémon
app.post("/pokemons", async (req, res) => {
  console.log("Request Body:", req.body); // Log the incoming request
  const { name, type, power, life, image } = req.body; // No change needed here

  // Validate required fields
  if (!name || !type || !power || !life) {
    return res.status(400).json({
      error: "Please provide all required fields: name, type, power, life.",
    });
  }

  // Insert new Pokémon into the database
  const { data, error } = await supabase
    .from("pokemon")
    .insert([{ name, type, power, life, image }]); // No change needed here

  // Handle any errors during the insert
  if (error) return res.status(400).json({ error: error.message });

  // Return success response with the added Pokémon
  res.status(201).json({
    message: "Pokémon added successfully!",
    pokemon: data,
  });
});

// Route to update pokemon information
app.put("/pokemons/:id", async (req, res) => {
  const { id } = req.params;
  const { name, typeId, power, life } = req.body; // Assume these are sent in the body

  const { data, error } = await supabase
    .from("pokemon")
    .update({ name, type_id: typeId, power, life })
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});
// Route to get all Pokémon types
app.get("/pokemon_types", async (req, res) => {
  const { data: types, error } = await supabase.from("pokemon_type").select(`
      id,
      name
    `);

  if (error) return res.status(400).json({ error: error.message });
  res.json(types);
});

// Route to get a team's pokemons
app.get("/teams/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: teams, error } = await supabase.rpc(
      "get_teams_with_pokemons",
      {
        p_user_id: userId,
      }
    );

    if (error) {
      console.error("Error retrieving teams:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json(teams);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});
app.get("/teams/with-pokemons/exclude/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log("user id : " + userId);

  try {
    const { data, error } = await supabase.rpc("get_enemy_teams", {
      current_user_id: userId, // Make sure the parameter matches the function definition
    });
    if (error) {
      console.error("Error fetching enemy teams:", error.message);
      return res
        .status(500)
        .json({ error: "Server error", details: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No enemy teams found." });
    }

    console.log("Fetched enemy teams:", data); // Log the data structure
    res.json(data);
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).send("Server error");
  }
});

app.get("/teams", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({ error: "No authentication token provided." });
  }

  try {
    // Verify the token and get the user
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser(token);

    if (sessionError || !user) {
      return res.status(401).json({ error: "User is not authenticated." });
    }

    const userId = user.id; // Get the unique user ID from the authenticated user

    // Log user ID for debugging
    console.log("Fetching teams for user ID:", userId);

    // Retrieve teams for the current user
    const { data: teams, error: teamsError } = await supabase
      .from("team")
      .select("*")
      .eq("user_id", userId); // Make sure you're querying by user_id

    if (teamsError) {
      console.error("Error fetching teams:", teamsError);
      return res.status(400).json({ error: teamsError.message });
    }

    // Log the teams for debugging
    console.log("Teams fetched:", teams);

    // Respond with the fetched teams
    res.json(teams);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// Route to add a new team
app.post("/teams", async (req, res) => {
  console.log("Received request to create team:", req.body); // Log the incoming request body

  const { teamName, pokemonIds } = req.body; // Get teamName and Pokémon IDs from the request body

  // Ensure pokemonIds is an array of exactly 6 Pokémon IDs
  if (!Array.isArray(pokemonIds) || pokemonIds.length !== 6) {
    return res
      .status(400)
      .json({ error: "A team must contain exactly 6 Pokémon." });
  }

  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({ error: "No authentication token provided." });
  }

  try {
    // Verify the token and get the user
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser(token);

    console.log(user);
    if (sessionError || !user) {
      return res.status(401).json({ error: "User is not authenticated." });
    }

    const userId = user.id; // Get the unique user ID from the authenticated user

    // Call the insert_team function to create the team
    const { data: teamData, error: teamError } = await supabase.rpc(
      "insert_team",
      {
        p_user_id: userId,
        p_team_name: teamName,
      }
    );

    // Handle any errors that may occur during team insertion
    if (teamError) {
      console.error("Team insertion error:", teamError); // Log the error
      return res.status(400).json({ error: teamError.message });
    }

    // Log the team JSON
    console.log("Team JSON:", teamData);

    const teamId = teamData; // Get the created team ID from the RPC response

    // Call the add_pokemon_to_team function to add Pokémon to the team
    const { error: pokemonError } = await supabase.rpc("add_pokemon_to_team", {
      p_team_id: teamId,
      p_pokemon_ids: pokemonIds,
      p_slot_numbers: [1, 2, 3, 4, 5, 6], // Assign slot numbers 1-6
    });

    // Handle any errors that may occur during Pokémon insertion
    if (pokemonError) {
      console.error("Pokémon insertion error:", pokemonError); // Log the error
      return res.status(400).json({ error: pokemonError.message });
    }

    // Log the Pokémon JSON
    console.log("Pokémon added to team:", pokemonIds);

    // Respond with the created team data
    res.json({ teamId, teamName, pokemonIds });
  } catch (err) {
    // Handle any unexpected errors
    console.error("Unexpected error:", err); // Log the unexpected error
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
