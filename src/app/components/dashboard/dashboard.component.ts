import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  currentDate: Date = new Date();

  recentOrders = [
    { id: '#1234', type: 'Dine-in', customer: 'Table 5', amount: '$45.00', status: 'In Progress' },
    { id: '#1233', type: 'Delivery', customer: 'John Doe', amount: '$32.50', status: 'Preparing' },
    { id: '#1232', type: 'Takeaway', customer: 'Sarah Smith', amount: '$28.75', status: 'Completed' }
  ];
  
  staffOnDuty = [
    { name: 'Mike Johnson', role: 'Head Chef', avatar: 'MJ' },
    { name: 'Lisa Chen', role: 'Server', avatar: 'LC' },
    { name: 'David Wilson', role: 'Delivery Driver', avatar: 'DW' }
  ];

  ngOnInit() {
    // Optional: If you want to update the date periodically
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000); // Updates every minute
  }
}