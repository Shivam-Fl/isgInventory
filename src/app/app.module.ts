import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OrdersComponent } from './components/orders/orders.component';
import { MenuComponent } from './components/menu/menu.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { DeliveryComponent } from './components/delivery/delivery.component';
import { FinanceComponent } from './components/finance/finance.component';

// Import standalone components properly
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ToastrModule } from 'ngx-toastr';  


@NgModule({
  declarations: [
    AppComponent,
    // Non-standalone components
    OrdersComponent,
    MenuComponent,
    InventoryComponent,
    EmployeesComponent,
    DeliveryComponent,
    FinanceComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    RouterModule,
    FontAwesomeModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    SidebarComponent,
    DashboardComponent,
    BreadcrumbComponent,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }