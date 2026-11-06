import { Routes } from '@angular/router';
import { Elenco } from './pages/elenco/elenco';
import { Dettaglio } from './pages/dettaglio/dettaglio';

export const routes: Routes = [
  { path: '', redirectTo: '/elenco', pathMatch: 'full' },
  { path: 'elenco', component: Elenco },
  { path: 'risorsa/:id', component: Dettaglio },
  { path: '**', redirectTo: '/elenco' },
];
