import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule

import { AppComponent } from './app.component';
import { TeamComponent } from './team/team.component';

@NgModule({
  declarations: [AppComponent, TeamComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule, // Add FormsModule to imports
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
