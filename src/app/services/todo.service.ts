import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Todo } from '../models/todo';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly url = 'https://jsonplaceholder.typicode.com/todos';

  // Signal privati: solo il servizio li può modificare
  private readonly _todos = signal<Todo[]>([]);
  private readonly _elemento = signal<Todo | null>(null);
  private readonly _caricamento = signal(false);
  private readonly _errore = signal<string | null>(null);

  // Esposti in sola lettura con asReadonly(): le pagine possono leggerli ma non scriverli
  readonly todos = this._todos.asReadonly();
  readonly elemento = this._elemento.asReadonly();
  readonly caricamento = this._caricamento.asReadonly();
  readonly errore = this._errore.asReadonly();

  // GET /todos: carica l'elenco completo
  caricaElenco(): void {
    this._caricamento.set(true);
    this._errore.set(null);
    this.http.get<Todo[]>(this.url).subscribe({
      next: (todos) => {
        this._todos.set(todos);
        this._caricamento.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this._errore.set(this.messaggioErrore(err));
        this._caricamento.set(false);
      },
    });
  }

  // GET /todos/:id: carica un singolo elemento
  caricaElemento(id: number): void {
    this._elemento.set(null);
    this._caricamento.set(true);
    this._errore.set(null);
    this.http.get<Todo>(`${this.url}/${id}`).subscribe({
      next: (todo) => {
        this._elemento.set(todo);
        this._caricamento.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this._errore.set(this.messaggioErrore(err));
        this._caricamento.set(false);
      },
    });
  }

  // POST /todos: JSONPlaceholder NON salva davvero il dato, risponde solo
  // con l'oggetto "creato" e un id fisso (201). Per questo lo aggiungiamo
  // noi in testa alla lista locale, altrimenti non lo vedremmo mai.
  creaTodo(dati: { userId: number; title: string; completed: boolean }): void {
    this._errore.set(null);
    this.http.post<Todo>(this.url, dati).subscribe({
      next: (nuovo) => this._todos.update((lista) => [nuovo, ...lista]),
      error: (err: HttpErrorResponse) => this._errore.set(this.messaggioErrore(err)),
    });
  }

  // Gestione errori: trasforma l'errore HTTP in un messaggio per l'utente
  private messaggioErrore(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Rete assente: impossibile contattare il server. Controlla la connessione.';
    }
    if (err.status === 404) {
      return 'Elemento non trovato: l\'id richiesto non esiste (404).';
    }
    return `Errore del server (codice ${err.status}).`;
  }
}
