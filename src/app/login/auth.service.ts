import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { API_CONFIG } from '../config/api.config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  email?: string;
  firmName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}${API_CONFIG.auth.login}`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.API_URL, credentials).pipe(
      tap((response) => {
        if (response.success && response.token) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('logged_in_user', JSON.stringify({
            email: response.email,
            firmName: response.firmName
          }));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('logged_in_user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}