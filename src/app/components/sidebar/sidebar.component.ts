import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faTachometerAlt,
  faClipboardList,
  faUtensils,
  faBoxes,
  faUsers,
  faTruck,
  faMoneyBillWave,
  faAngleLeft,
  faAngleRight
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [RouterModule, FontAwesomeModule, CommonModule]
})
export class SidebarComponent {
  dashboardIcon = faTachometerAlt;
  ordersIcon = faClipboardList;
  menuIcon = faUtensils;
  inventoryIcon = faBoxes;
  employeesIcon = faUsers;
  deliveryIcon = faTruck;
  financeIcon = faMoneyBillWave;
  angleLeftIcon = faAngleLeft;
  angleRightIcon = faAngleRight;

  isCollapsed = false;
  isMobile = window.innerWidth <= 768;

  menuItems = [
    { name: 'Dashboard', icon: this.dashboardIcon, route: '/dashboard', notification: 3 },
    { name: 'Orders', icon: this.ordersIcon, route: '/orders', notification: 12 },
    { name: 'Menu', icon: this.menuIcon, route: '/menu', notification: 0 },
    { name: 'Inventory', icon: this.inventoryIcon, route: '/inventory', notification: 2 },
    { name: 'Delivery', icon: this.deliveryIcon, route: '/delivery', notification: 5 }
  ];

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      this.isCollapsed = false; // Ensure horizontal bar is not collapsed on mobile
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}