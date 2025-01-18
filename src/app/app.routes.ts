import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BodyComponent } from './shared/components/body/body.component';
import { BiographyComponent } from './shared/components/biography/biography.component';
import { AboutComponent } from './shared/components/about/about.component';
import { Pages } from './shared/enums/pages.enum';
import { ContactComponent } from './shared/components/contact/contact.component';
import { SchedulingComponent } from './shared/components/scheduling/scheduling.component';

export const routes: Routes = [
  { path: Pages.HOME, component: BodyComponent },
  { path: Pages.ABOUT, component: AboutComponent },
  { path: Pages.CONTACT, component: ContactComponent },
  { path: Pages.SCHEDULING, component: SchedulingComponent },
  { path: Pages.BIO, component: BiographyComponent },
  { path: `${Pages.BIO}/:name`, component: BiographyComponent },
  { path: '**', redirectTo: '' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Configure the routes
  exports: [RouterModule], // Export RouterModule so it can be used in AppModule
})
export class AppRoutingModule {}