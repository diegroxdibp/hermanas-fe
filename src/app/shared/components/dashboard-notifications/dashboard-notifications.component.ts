import { Roles } from './../../enums/roles.enum';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session.service';

interface Person {
  name: string;
  earnings: number;
  alreadyPaid: number;
}

interface CalculationResult {
  person1: {
    totalShouldPay: number;
    stillOwes: number;
    percentage: number;
  };
  person2: {
    totalShouldPay: number;
    stillOwes: number;
    percentage: number;
  };
}

@Component({
  selector: 'app-dashboard-notifications',
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard-notifications.component.html',
  styleUrl: './dashboard-notifications.component.scss',
})
export class DashboardNotificationsComponent {
  readonly sessionService = inject(SessionService);
  Roles = Roles;

  person1: Person = {
    name: 'Person 1',
    earnings: 0,
    alreadyPaid: 0,
  };

  person2: Person = {
    name: 'Person 2',
    earnings: 0,
    alreadyPaid: 0,
  };

  totalExpenses: number = 0;
  result: CalculationResult | null = null;
  Math = Math; // For template access
  errorMessage: string = '';

  calculate(): void {
    // Reset error message
    this.errorMessage = '';

    // Validate inputs
    if (
      !this.isValidNumber(this.person1.earnings) ||
      !this.isValidNumber(this.person2.earnings)
    ) {
      this.errorMessage = 'Please enter valid earnings for both persons';
      this.result = null;
      return;
    }

    if (!this.isValidNumber(this.totalExpenses) || this.totalExpenses <= 0) {
      this.errorMessage = 'Please enter a valid total expense amount';
      this.result = null;
      return;
    }

    if (this.person1.earnings <= 0 || this.person2.earnings <= 0) {
      this.errorMessage = 'Earnings must be greater than zero';
      this.result = null;
      return;
    }

    // Default already paid to 0 if not provided
    const person1Paid = this.isValidNumber(this.person1.alreadyPaid)
      ? this.person1.alreadyPaid
      : 0;
    const person2Paid = this.isValidNumber(this.person2.alreadyPaid)
      ? this.person2.alreadyPaid
      : 0;

    // Calculate total earnings
    const totalEarnings = this.person1.earnings + this.person2.earnings;

    // Calculate percentage of total earnings for each person
    const person1Percentage = (this.person1.earnings / totalEarnings) * 100;
    const person2Percentage = (this.person2.earnings / totalEarnings) * 100;

    // Calculate how much each person should pay based on their earnings
    const person1ShouldPay =
      (this.person1.earnings / totalEarnings) * this.totalExpenses;
    const person2ShouldPay =
      (this.person2.earnings / totalEarnings) * this.totalExpenses;

    // Calculate balance (negative means they should receive money, positive means they owe)
    const person1Balance = person1ShouldPay - person1Paid;
    const person2Balance = person2ShouldPay - person2Paid;

    this.result = {
      person1: {
        totalShouldPay: person1ShouldPay,
        stillOwes: person1Balance,
        percentage: person1Percentage,
      },
      person2: {
        totalShouldPay: person2ShouldPay,
        stillOwes: person2Balance,
        percentage: person2Percentage,
      },
    };
  }

  private isValidNumber(value: any): boolean {
    return (
      value !== null &&
      value !== undefined &&
      value !== '' &&
      !isNaN(Number(value))
    );
  }
}
