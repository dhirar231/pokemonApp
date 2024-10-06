import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient,
  User,
  Session,
} from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://ryfxdsmvedzduoxhdder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Znhkc212ZWR6ZHVveGhkZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgxMzQxMTQsImV4cCI6MjA0MzcxMDExNH0.eZk2tPC8O1_CHqSGNkWxHHl0XJ1qKaUkCKlAIV2ef_c' // Replace with your actual public key
    );
  }

  // Corrected the function declaration
  async getAuthToken(): Promise<string | null> {
    try {
      const response = await this.supabase.auth.getSession();

      // Destructure the response to get data and error
      const { data, error } = response;

      // Check for errors or absence of session
      if (error || !data.session) {
        console.error(
          'Error retrieving token:',
          error?.message || 'No session found'
        );
        return null;
      }

      // Access the access token
      const accessToken = data.session.access_token;

      return accessToken; // Return the access token
    } catch (err) {
      console.error('Unexpected error while retrieving token:', err);
      return null;
    }
  }

  async signUp(
    email: string,
    password: string
  ): Promise<{
    user: User | null;
    session: Session | null;
    error: Error | null;
  }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    return { user: data.user, session: data.session, error };
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{
    user: User | null;
    session: Session | null;
    error: Error | null;
  }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log(data);
    return { user: data.user, session: data.session, error };
  }

  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await this.supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error);
        return null; // or handle the error as needed
      }

      const user = data.user;
      // if (user) {
      //   console.log('User email:', user.email); // Log the user's email
      //   console.log('User token:', this.getAuthToken()); // Log the user's email
      // } else {
      //   console.log('No user is logged in.');
      // }

      return user;
    } catch (err) {
      console.error('Unexpected error:', err);
      return null; // or handle the error as needed
    }
  }

  async onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ): Promise<void> {
    this.supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  // Additional methods can be added here, such as fetching user info
}
