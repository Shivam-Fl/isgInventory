import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OrdersComponent } from './components/orders/orders.component';
import { MenuComponent } from './components/menu/menu.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { DeliveryComponent } from './components/delivery/delivery.component';
import { FinanceComponent } from './components/finance/finance.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, data: { breadcrumb: 'Dashboard' } },
  { path: 'orders', component: OrdersComponent, data: { breadcrumb: 'Orders' } },
  { path: 'menu', component: MenuComponent, data: { breadcrumb: 'Menu' } },
  { path: 'inventory', component: InventoryComponent, data: { breadcrumb: 'Inventory' } },
  { path: 'employees', component: EmployeesComponent, data: { breadcrumb: 'Employees' } },
  { path: 'delivery', component: DeliveryComponent, data: { breadcrumb: 'Delivery' } },
  { path: 'finance', component: FinanceComponent, data: { breadcrumb: 'Finance' } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }