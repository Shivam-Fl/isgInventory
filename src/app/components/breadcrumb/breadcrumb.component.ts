// src/app/components/breadcrumb/breadcrumb.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BreadcrumbComponent {
  @Input() breadcrumbs: { label: string; url: string }[] = [];
}