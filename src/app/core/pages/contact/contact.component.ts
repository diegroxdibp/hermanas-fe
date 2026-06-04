import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavigationService } from '../../../shared/services/navigation.service';
import { Pages } from '../../../shared/enums/pages.enum';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  sent = false;

  form = new FormGroup({
    nome: new FormControl('', Validators.required),
    telefone: new FormControl('', Validators.required),
    assunto: new FormControl('', Validators.required),
    mensagem: new FormControl('', Validators.required),
  });

  constructor(private navigationService: NavigationService) {}

  isError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { nome, telefone, assunto, mensagem } = this.form.value;
    const bodyText = `${mensagem}\n\nNome: ${nome}\nTelefone: ${telefone}`;
    const mailtoLink = `mailto:luanebastos88@gmail.com?subject=${encodeURIComponent(assunto ?? '')}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoLink;

    this.sent = true;
    setTimeout(() => {
      this.sent = false;
      this.form.reset();
    }, 3200);
  }

  goToScheduling(): void {
    this.navigationService.navigateTo(Pages.SCHEDULING);
  }
}
