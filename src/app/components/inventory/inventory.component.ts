import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { ToastrService } from 'ngx-toastr';

// Register Chart.js components
Chart.register(...registerables);

// API response interfaces
interface ApiProduct {
  productId: number;
  productName: string;
  productDescription: string;
  unitPrice: number;
  reorderLevel: number;
  quantityInStock: number;
  category: number | ApiCategory;
  supplier: number[] | ApiSupplier[];
}

interface ApiCategory {
  categoryId: number;
  categoryName: string;
  products: any[];
}

interface ApiSupplier {
  supplierId: number;
  supplierName: string;
  contactInfo: string;
  address: string;
  product: any[];
}

// Application interfaces
interface InventoryProduct {
  id: number;
  productName: string;
  productDescription: string;
  unitPrice: number;
  reorderLevel: number;
  quantityInStock: number;
  category: InventoryCategory | null;
  supplier: InventorySupplier | null;
}

interface InventoryCategory {
  id: number;
  categoryName: string;
}

interface InventorySupplier {
  id: number;
  supplierName: string;
  contactInfo: string;
  address: string;
}

interface CategoryGroup {
  category: InventoryCategory;
  products: InventoryProduct[];
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  standalone: false,
})
export class InventoryComponent implements OnInit, AfterViewInit {
  activeTab: string = 'all';
  searchQuery: string = '';
  isLoading: boolean = true;

  private apiBaseUrl: string = 'https://hotelmgmt-app-latest.onrender.com/api';

  products: InventoryProduct[] = [];
  categories: InventoryCategory[] = [
    { id: 100, categoryName: 'Beverages' },
    { id: 101, categoryName: 'Snacks' },
    { id: 102, categoryName: 'Main Course' },
    { id: 103, categoryName: 'Desserts' },
    { id: 104, categoryName: 'Salads' },
    { id: 105, categoryName: 'Soups' },
    { id: 106, categoryName: 'Specials' },
  ];
  suppliers: InventorySupplier[] = [];
  categoryGroups: CategoryGroup[] = [];
  lowStockItems: InventoryProduct[] = [];
  categoryMap: Map<number, InventoryCategory> = new Map();

  newItem: any = {
    productName: '',
    productDescription: '',
    unitPrice: 0,
    reorderLevel: 0,
    quantityInStock: 0,
    category: null,
    supplier: null,
  };

  newCategoryName: string = '';
  newSupplierData = {
    supplierName: '',
    contactInfo: '',
    address: '',
  };

  showAddItemModal: boolean = false;
  showUpdateStockModal: boolean = false;
  selectedProduct: InventoryProduct | null = null;
  newStockValue: number = 0;
  isCreatingNewCategory: boolean = false;
  isCreatingNewSupplier: boolean = false;

  @ViewChild('inventoryChart') inventoryChartRef!: ElementRef;
  chart: Chart | undefined;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    // Initialize categoryMap with default categories
    this.categories.forEach(category => {
      this.categoryMap.set(category.id, category);
    });
  }

  ngOnInit() {
    console.log('Inventory component initialized');
    this.fetchInitialData();
  }

  ngAfterViewInit() {
    console.log('View initialized, chart reference available:', !!this.inventoryChartRef);
    setTimeout(() => {
      this.createChart();
    }, 500);
  }

  fetchInitialData() {
    this.isLoading = true;
    this.fetchCategories(() => {
      this.fetchSuppliers(() => {
        this.fetchProducts();
      });
    });
  }

  fetchProducts() {
    console.log('Fetching products...');
    this.http.get<any[]>(`${this.apiBaseUrl}/products`).subscribe(
      (data) => {
        console.log('Fetched products:', JSON.stringify(data, null, 2));
        this.products = this.mapApiProducts(data);
        this.organizeProductsByCategory();
        this.findLowStockItems();
        setTimeout(() => {
          this.createChart();
        }, 300);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching products:', error);
        this.isLoading = false;
        this.products = [];
        this.organizeProductsByCategory();
        this.findLowStockItems();
        this.toastr.error('Failed to fetch products.', 'Error');
        this.cdr.detectChanges();
      }
    );
  }

  mapApiProducts(apiProducts: any[]): InventoryProduct[] {
    return apiProducts
      .filter((item) => typeof item === 'object')
      .map((item) => {
        let categoryObj: InventoryCategory | null = null;

        if (item.category) {
          if (typeof item.category === 'number') {
            categoryObj = this.categoryMap.get(item.category) || {
              id: item.category,
              categoryName: `Category ${item.category}`,
            };
          } else if (typeof item.category === 'object') {
            categoryObj = {
              id: item.category.categoryId,
              categoryName: item.category.categoryName,
            };
            if (!this.categoryMap.has(categoryObj.id)) {
              this.categoryMap.set(categoryObj.id, categoryObj);
              this.categories.push(categoryObj);
            }
          }
        }

        let supplierObj: InventorySupplier | null = null;
        if (item.supplier && Array.isArray(item.supplier) && item.supplier.length > 0) {
          const firstSupplier = item.supplier[0];
          if (typeof firstSupplier === 'number') {
            const foundSupplier = this.suppliers.find(s => s.id === firstSupplier);
            if (foundSupplier) {
              supplierObj = foundSupplier;
            }
          } else if (typeof firstSupplier === 'object') {
            supplierObj = {
              id: firstSupplier.supplierId,
              supplierName: firstSupplier.supplierName,
              contactInfo: firstSupplier.contactInfo,
              address: firstSupplier.address,
            };
          }
        }

        return {
          id: item.productId,
          productName: item.productName,
          productDescription: item.productDescription,
          unitPrice: item.unitPrice,
          reorderLevel: item.reorderLevel,
          quantityInStock: item.quantityInStock,
          category: categoryObj,
          supplier: supplierObj,
        };
      });
  }

  fetchCategories(callback?: () => void) {
    console.log('Fetching categories...');
    this.http.get<any[]>(`${this.apiBaseUrl}/categories`).subscribe(
      (data) => {
        console.log('Fetched categories:', data);
        const fetchedCategories = data
          .filter((item) => typeof item === 'object')
          .map((item) => ({
            id: item.categoryId,
            categoryName: item.categoryName,
          }));

        fetchedCategories.forEach((category) => {
          if (!this.categoryMap.has(category.id)) {
            this.categories.push(category);
            this.categoryMap.set(category.id, category);
          }
        });

        console.log('Updated categories:', this.categories);
        if (callback) callback();
      },
      (error) => {
        console.error('Error fetching categories:', error);
        this.toastr.error('Failed to fetch additional categories.', 'Error');
        if (callback) callback();
      }
    );
  }

  fetchSuppliers(callback?: () => void) {
    console.log('Fetching suppliers...');
    this.http.get<any[]>(`${this.apiBaseUrl}/suppliers`).subscribe(
      (data) => {
        console.log('Fetched suppliers:', data);
        this.suppliers = data
          .filter((item) => typeof item === 'object')
          .map((item) => ({
            id: item.supplierId,
            supplierName: item.supplierName,
            contactInfo: item.contactInfo,
            address: item.address,
          }));
        if (callback) callback();
      },
      (error) => {
        console.error('Error fetching suppliers:', error);
        this.suppliers = [];
        this.toastr.error('Failed to fetch suppliers.', 'Error');
        if (callback) callback();
      }
    );
  }

  organizeProductsByCategory() {
    this.categoryGroups = [];

    const productCategories = new Set<number>();
    this.products.forEach(product => {
      if (product.category) {
        productCategories.add(product.category.id);
        if (!this.categoryMap.has(product.category.id)) {
          this.categoryMap.set(product.category.id, product.category);
        }
      }
    });

    productCategories.forEach(categoryId => {
      if (!this.categories.some(c => c.id === categoryId)) {
        const category = this.categoryMap.get(categoryId);
        if (category) {
          this.categories.push(category);
        }
      }
    });

    this.categories.forEach((category) => {
      const productsInCategory = this.products.filter(
        (product) => product.category && product.category.id === category.id
      );
      if (productsInCategory.length > 0) {
        this.categoryGroups.push({
          category: category,
          products: productsInCategory,
        });
      }
    });

    const uncategorizedProducts = this.products.filter((product) => !product.category);
    if (uncategorizedProducts.length > 0) {
      const uncategorizedCategory: InventoryCategory = {
        id: -1,
        categoryName: 'Uncategorized',
      };
      this.categoryGroups.push({
        category: uncategorizedCategory,
        products: uncategorizedProducts,
      });
    }

    console.log(`Organized products into ${this.categoryGroups.length} category groups`);
    this.cdr.detectChanges();
  }

  findLowStockItems() {
    this.lowStockItems = this.products.filter(
      (item) => item.quantityInStock <= item.reorderLevel
    );
    console.log(`Found ${this.lowStockItems.length} low stock items`);
  }

  setActiveTab(tab: string) {
    console.log(`Setting active tab to: ${tab}`);
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  getCategorySafeId(category: InventoryCategory): string {
    return `category-${category.id}`;
  }

  createChart() {
    console.log('Creating chart...');
    if (!this.inventoryChartRef || !this.inventoryChartRef.nativeElement) {
      console.warn('Chart canvas not found');
      return;
    }
    const ctx = this.inventoryChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.warn('Canvas context not available');
      return;
    }
    if (this.products.length === 0) {
      console.warn('No product data for chart');
      return;
    }
    const categoryGroups = [...this.categoryGroups];
    if (categoryGroups.length === 0) {
      console.warn('No category groups available for chart');
      return;
    }
    const categoryLabels = categoryGroups.map((group) => group.category.categoryName);
    const stockData = categoryGroups.map((group) =>
      group.products.reduce((sum, product) => sum + product.quantityInStock, 0)
    );
    console.log('Chart data:', { labels: categoryLabels, data: stockData });
    if (categoryLabels.length === 0) {
      console.warn('No valid categories for chart');
      return;
    }
    if (this.chart) {
      this.chart.destroy();
    }
    try {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: categoryLabels,
          datasets: [
            {
              label: 'Stock Level',
              data: stockData,
              backgroundColor: 'rgba(107, 72, 255, 0.2)',
              borderColor: 'rgba(107, 72, 255, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      });
      console.log('Chart created');
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  openAddItemModal() {
    this.showAddItemModal = true;
    this.newItem = {
      productName: '',
      productDescription: '',
      unitPrice: 0,
      reorderLevel: 0,
      quantityInStock: 0,
      category: this.categories.length > 0 ? this.categories[0] : null,
      supplier: this.suppliers.length > 0 ? this.suppliers[0] : null,
    };
    this.newCategoryName = '';
    this.newSupplierData = {
      supplierName: '',
      contactInfo: '',
      address: '',
    };
    this.isCreatingNewCategory = false;
    this.isCreatingNewSupplier = false;
    this.cdr.detectChanges();
  }

  closeAddItemModal() {
    this.showAddItemModal = false;
    this.cdr.detectChanges();
  }

  toggleCategoryCreation() {
    this.isCreatingNewCategory = !this.isCreatingNewCategory;
    if (this.isCreatingNewCategory) {
      this.newCategoryName = '';
      this.newItem.category = null;
    } else if (this.categories.length > 0) {
      this.newItem.category = this.categories[0];
    }
    this.cdr.detectChanges();
  }

  toggleSupplierCreation() {
    this.isCreatingNewSupplier = !this.isCreatingNewSupplier;
    if (this.isCreatingNewSupplier) {
      this.newSupplierData = {
        supplierName: '',
        contactInfo: '',
        address: '',
      };
      this.newItem.supplier = null;
    } else if (this.suppliers.length > 0) {
      this.newItem.supplier = this.suppliers[0];
    }
    this.cdr.detectChanges();
  }

  createNewCategory() {
    if (!this.newCategoryName || this.newCategoryName.trim() === '') {
      this.toastr.warning('Please enter a category name', 'Warning');
      return;
    }

    if (this.categories.some(c => c.categoryName.toLowerCase() === this.newCategoryName.toLowerCase())) {
      this.toastr.warning('Category name already exists', 'Warning');
      return;
    }

    const maxId = Math.max(...this.categories.map(c => c.id), 106);
    const newCategoryId = maxId + 1;

    const newCategory = {
      categoryId: newCategoryId,
      categoryName: this.newCategoryName,
    };

    this.http.post<any>(`${this.apiBaseUrl}/categories`, newCategory).subscribe(
      (response) => {
        console.log('New category created:', response);
        const category: InventoryCategory = {
          id: response.categoryId,
          categoryName: response.categoryName,
        };
        this.categories.push(category);
        this.categoryMap.set(category.id, category);
        this.newItem.category = category;
        this.newCategoryName = '';
        this.isCreatingNewCategory = false;
        this.toastr.success('Category created successfully', 'Success');
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error creating category:', error);
        this.toastr.error('Failed to create category', 'Error');
      }
    );
  }

  createNewSupplier() {
    if (!this.newSupplierData.supplierName || this.newSupplierData.supplierName.trim() === '') {
      this.toastr.warning('Please enter a supplier name', 'Warning');
      return;
    }
    const newSupplier = {
      supplierName: this.newSupplierData.supplierName,
      contactInfo: this.newSupplierData.contactInfo,
      address: this.newSupplierData.address,
    };
    this.http.post<any>(`${this.apiBaseUrl}/suppliers`, newSupplier).subscribe(
      (response) => {
        console.log('New supplier created:', response);
        const supplier: InventorySupplier = {
          id: response.supplierId,
          supplierName: response.supplierName,
          contactInfo: response.contactInfo,
          address: response.address,
        };
        this.suppliers.push(supplier);
        this.newItem.supplier = supplier;
        this.newSupplierData = {
          supplierName: '',
          contactInfo: '',
          address: '',
        };
        this.toastr.success('Supplier created successfully', 'Success');
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error creating supplier:', error);
        this.toastr.error('Failed to create supplier', 'Error');
      }
    );
  }

  addItem(form: NgForm) {
    if (form.valid) {
      console.log('Adding item:', this.newItem);

      const createCategoryPromise = this.isCreatingNewCategory && this.newCategoryName
        ? new Promise<InventoryCategory>((resolve, reject) => {
            if (this.categories.some(c => c.categoryName.toLowerCase() === this.newCategoryName.toLowerCase())) {
              this.toastr.warning('Category name already exists', 'Warning');
              reject(new Error('Category name already exists'));
              return;
            }

            const maxId = Math.max(...this.categories.map(c => c.id), 106);
            const newCategoryId = maxId + 1;

            this.http
              .post<any>(`${this.apiBaseUrl}/categories`, {
                categoryId: newCategoryId,
                categoryName: this.newCategoryName,
              })
              .subscribe({
                next: (response) => {
                  const category: InventoryCategory = {
                    id: response.categoryId,
                    categoryName: response.categoryName,
                  };
                  this.categories.push(category);
                  this.categoryMap.set(category.id, category);
                  resolve(category);
                },
                error: (error) => {
                  console.error('Error creating category:', error);
                  reject(error);
                },
              });
          })
        : Promise.resolve(this.newItem.category);

      const createSupplierPromise = this.isCreatingNewSupplier && this.newSupplierData.supplierName
        ? new Promise<InventorySupplier>((resolve, reject) => {
            this.http.post<any>(`${this.apiBaseUrl}/suppliers`, this.newSupplierData).subscribe({
              next: (response) => {
                const supplier: InventorySupplier = {
                  id: response.supplierId,
                  supplierName: response.supplierName,
                  contactInfo: response.contactInfo,
                  address: response.address,
                };
                this.suppliers.push(supplier);
                resolve(supplier);
              },
              error: (error) => {
                console.error('Error creating supplier:', error);
                reject(error);
              },
            });
          })
        : Promise.resolve(this.newItem.supplier);

      Promise.all([createCategoryPromise, createSupplierPromise])
        .then(([category, supplier]) => {
          const apiProduct = {
            productName: this.newItem.productName,
            productDescription: this.newItem.productDescription,
            unitPrice: this.newItem.unitPrice,
            reorderLevel: this.newItem.reorderLevel,
            quantityInStock: this.newItem.quantityInStock,
            category: category ? { categoryId: category.id } : null,
            supplier: supplier ? [{ supplierId: supplier.id }] : null,
          };

          this.http.post<any>(`${this.apiBaseUrl}/products`, apiProduct).subscribe({
            next: (response) => {
              console.log('Item added:', response);
              const newProduct: InventoryProduct = {
                id: response.productId,
                productName: response.productName,
                productDescription: response.productDescription,
                unitPrice: response.unitPrice,
                reorderLevel: response.reorderLevel,
                quantityInStock: response.quantityInStock,
                category: response.category
                  ? {
                      id: response.category.categoryId,
                      categoryName: response.category.categoryName,
                    }
                  : null,
                supplier: response.supplier
                  ? {
                      id: response.supplier.supplierId,
                      supplierName: response.supplier.supplierName,
                      contactInfo: response.supplier.contactInfo,
                      address: response.supplier.address,
                    }
                  : null,
              };
              this.products.push(newProduct);
              this.organizeProductsByCategory();
              this.findLowStockItems();
              this.createChart();
              this.closeAddItemModal();
              this.toastr.success('Item added successfully', 'Success');
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error adding item:', error);
              this.toastr.error('Failed to add item', 'Error');
            },
          });
        })
        .catch((error) => {
          console.error('Error in category/supplier creation:', error);
          this.toastr.error('Failed to create category or supplier', 'Error');
        });
    } else {
      console.warn('Form invalid');
      this.toastr.warning('Please fill all required fields', 'Warning');
    }
  }

  updateStock(product: InventoryProduct, amount: number) {
    const updatedStock = product.quantityInStock + amount;
    if (updatedStock < 0) {
      this.toastr.warning('Stock cannot be negative', 'Warning');
      return;
    }

    console.log(`Quick-updating stock for ${product.productName} by ${amount}`);

    const originalStock = product.quantityInStock;
    product.quantityInStock = updatedStock;
    this.findLowStockItems();

    this.http
      .patch<any>(`${this.apiBaseUrl}/products/${product.id}`, {
        quantityInStock: updatedStock,
      })
      .subscribe({
        next: (response) => {
          console.log('Stock updated:', response);
          const index = this.products.findIndex((p) => p.id === product.id);
          if (index !== -1) {
            this.products[index] = {
              ...this.products[index],
              quantityInStock: response.quantityInStock,
            };
          }

          this.organizeProductsByCategory();
          this.findLowStockItems();
          this.createChart();
          this.toastr.success('Stock updated successfully', 'Success');
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error updating stock:', error);
          product.quantityInStock = originalStock;
          this.findLowStockItems();
          this.toastr.error('Failed to update stock', 'Error');
          this.cdr.detectChanges();
        },
      });
  }

  openUpdateStockModal(product: InventoryProduct) {
    this.selectedProduct = product;
    this.newStockValue = product.quantityInStock;
    this.showUpdateStockModal = true;
    this.cdr.detectChanges();
  }

  closeUpdateStockModal() {
    this.showUpdateStockModal = false;
    this.selectedProduct = null;
    this.cdr.detectChanges();
  }

  submitStockUpdate(form: NgForm) {
    if (form.valid && this.selectedProduct) {
      const product = this.selectedProduct;
      const newQuantity = this.newStockValue;

      console.log(`Updating stock for ${product.productName} to ${newQuantity}`);

      const originalQuantity = product.quantityInStock;
      product.quantityInStock = newQuantity;
      this.findLowStockItems();

      this.http
        .patch<any>(`${this.apiBaseUrl}/products/${product.id}`, {
          quantityInStock: newQuantity,
        })
        .subscribe({
          next: (response) => {
            console.log('Stock updated:', response);
            const index = this.products.findIndex((p) => p.id === product.id);
            if (index !== -1) {
              this.products[index] = {
                ...this.products[index],
                quantityInStock: response.quantityInStock,
              };
            }

            this.organizeProductsByCategory();
            this.findLowStockItems();
            this.createChart();
            this.closeUpdateStockModal();
            this.toastr.success('Stock updated successfully', 'Success');
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error updating stock:', error);
            if (this.selectedProduct) {
              this.selectedProduct.quantityInStock = originalQuantity;
            }
            this.findLowStockItems();
            this.toastr.error('Failed to update stock', 'Error');
            this.cdr.detectChanges();
          },
        });
    } else {
      this.toastr.warning('Please enter a valid stock value', 'Warning');
    }
  }

  deleteProduct(product: InventoryProduct) {
    if (confirm(`Are you sure you want to delete ${product.productName}?`)) {
      console.log(`Deleting ${product.productName}`);

      this.products = this.products.filter((p) => p.id !== product.id);
      this.organizeProductsByCategory();
      this.findLowStockItems();

      this.http.delete(`${this.apiBaseUrl}/products/${product.id}`).subscribe({
        next: () => {
          console.log('Product deleted');
          this.createChart();
          this.toastr.success('Product deleted successfully', 'Success');
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.fetchProducts();
          this.toastr.error('Failed to delete product', 'Error');
        },
      });
    }
  }

  getFilteredProductsForCategory(categoryGroup: CategoryGroup) {
    let filteredProducts = categoryGroup.products;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredProducts = categoryGroup.products.filter(
        (item) =>
          item.productName.toLowerCase().includes(query) ||
          item.productDescription.toLowerCase().includes(query)
      );
    }
    // Limit to 3 items per category when viewing "All Items" tab
    if (this.activeTab === 'all') {
      return filteredProducts.slice(0, 3);
    }
    return filteredProducts;
  }

  get filteredLowStock() {
    if (!this.searchQuery) return this.lowStockItems;
    const query = this.searchQuery.toLowerCase();
    return this.lowStockItems.filter(
      (item) =>
        item.productName.toLowerCase().includes(query) ||
        item.productDescription.toLowerCase().includes(query)
    );
  }

  getCategoryIcon(categoryName?: string): string {
    if (!categoryName) return 'inventory';
    const name = categoryName.toLowerCase();
    if (name.includes('beverage')) return 'local_drink';
    if (name.includes('snack')) return 'fastfood';
    if (name.includes('main course')) return 'restaurant_menu';
    if (name.includes('dessert')) return 'cake';
    if (name.includes('salad')) return 'grass';
    if (name.includes('soup')) return 'soup_kitchen';
    if (name.includes('special')) return 'star';
    return 'inventory';
  }
}