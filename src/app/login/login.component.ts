import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Redirect if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/inventory']);
      return;
    }

    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['admin@bullion.com', [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/inventory']);
        } else {
          this.errorMessage = response.message || 'Login failed. Please check your credentials.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to backend server. Ensure Spring Boot is running.';
        } else {
          this.errorMessage = err.error?.message || 'An unexpected error occurred. Please try again.';
        }
      }
    });
  }
}