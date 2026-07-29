'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import API from '@/services/api';
import {
  ShoppingBag,
  TrendingUp,
  FolderDot,
  ShieldCheck,
  Tag,
  Gift,
} from 'lucide-react';

import AdminDashboardTab from '@/components/admin/AdminDashboardTab';
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';
import AdminProductsTab from '@/components/admin/AdminProductsTab';
import AdminCategoriesTab from '@/components/admin/AdminCategoriesTab';
import AdminCouponsTab from '@/components/admin/AdminCouponsTab';
import AdminCombosTab from '@/components/admin/AdminCombosTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';

type TabId = 'dashboard' | 'orders' | 'products' | 'categories' | 'coupons' | 'combos' | 'users';

export default function AdminDashboard({ defaultTab = 'dashboard' }: { defaultTab?: TabId }) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: statsData, refetch: refetchStats, error: statsError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await API.get('/admin/stats');
      return res.data?.stats;
    },
  });

  const { data: ordersData, refetch: refetchOrders, error: ordersError } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await API.get('/orders');
      return res.data?.orders;
    },
  });

  const { data: productsData, refetch: refetchProducts, error: productsError } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await API.get('/products');
      return res.data?.products;
    },
  });

  const { data: categoriesData, refetch: refetchCategories, error: categoriesError } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await API.get('/categories');
      return res.data?.categories;
    },
  });

  const { data: couponsData, refetch: refetchCoupons, error: couponsError } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await API.get('/coupons');
      return res.data?.coupons;
    },
  });

  const { data: combosData, refetch: refetchCombos, error: combosError } = useQuery({
    queryKey: ['admin-combos'],
    queryFn: async () => {
      const res = await API.get('/combos');
      return res.data?.combos;
    },
  });

  const { data: usersData, refetch: refetchUsers, error: usersError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await API.get('/admin/users');
      return res.data?.users;
    },
  });

  const { data: cakeAnalytics, refetch: refetchCakeAnalytics, error: cakeAnalyticsError } = useQuery({
    queryKey: ['admin-analytics-cakes'],
    queryFn: async () => {
      const res = await API.get('/admin/analytics/cakes');
      return res.data?.analytics;
    },
  });

  const { data: comboAnalytics, refetch: refetchComboAnalytics, error: comboAnalyticsError } = useQuery({
    queryKey: ['admin-analytics-combos'],
    queryFn: async () => {
      const res = await API.get('/admin/analytics/combos');
      return res.data?.analytics;
    },
  });

  const { data: comparisonAnalytics, refetch: refetchComparison, error: comparisonError } = useQuery({
    queryKey: ['admin-analytics-comparison'],
    queryFn: async () => {
      const res = await API.get('/admin/analytics/comparison');
      return res.data?.comparison;
    },
  });

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await API.put(`/orders/${orderId}`, { status });
      refetchOrders();
      refetchStats();
      refetchCakeAnalytics();
      refetchComboAnalytics();
      refetchComparison();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentChange = async (orderId: string, paymentStatus: string) => {
    try {
      await API.put(`/orders/${orderId}`, { paymentStatus });
      refetchOrders();
      refetchStats();
      refetchCakeAnalytics();
      refetchComboAnalytics();
      refetchComparison();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      description: fd.get('description') as string,
      price: parseFloat(fd.get('price') as string),
      discountPrice: fd.get('discountPrice') ? parseFloat(fd.get('discountPrice') as string) : null,
      stock: parseInt(fd.get('stock') as string, 10),
      categoryId: fd.get('categoryId') as string,
      ingredients: fd.get('ingredients') as string,
      prepTime: parseInt(fd.get('prepTime') as string, 10),
      images: [fd.get('imageUrl') as string || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'],
      variants: [
        { weight: 1.0, flavor: 'Standard', priceModifier: 0.0 },
        { weight: 2.0, flavor: 'Standard', priceModifier: 550.0 },
      ],
    };
    try {
      if (editingItem) await API.put(`/products/${editingItem.id}`, data);
      else await API.post('/products', data);
      closeModal();
      refetchProducts();
      refetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = { name: fd.get('name') as string, description: fd.get('description') as string };
    try {
      if (editingItem) await API.put(`/categories/${editingItem.id}`, data);
      else await API.post('/categories', data);
      closeModal();
      refetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      code: fd.get('code') as string,
      discountPercentage: parseFloat(fd.get('discountPercentage') as string),
      maxDiscount: fd.get('maxDiscount') ? parseFloat(fd.get('maxDiscount') as string) : null,
      expiryDate: new Date(fd.get('expiryDate') as string).toISOString(),
    };
    try {
      if (editingItem) await API.put(`/coupons/${editingItem.id}`, data);
      else await API.post('/coupons', data);
      closeModal();
      refetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComboSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const items = (fd.get('items') as string).split(',').map((s) => s.trim());
    const data = {
      name: fd.get('name') as string,
      description: fd.get('description') as string,
      price: parseFloat(fd.get('price') as string),
      items,
    };
    try {
      if (editingItem) await API.put(`/combos/${editingItem.id}`, data);
      else await API.post('/combos', data);
      closeModal();
      refetchCombos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await API.delete(`/${type}/${id}`);
      if (type === 'products') refetchProducts();
      else if (type === 'categories') refetchCategories();
      else if (type === 'coupons') refetchCoupons();
      else if (type === 'combos') refetchCombos();
      else if (type === 'admin/users') refetchUsers();
      refetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      password: fd.get('password') as string,
      role: fd.get('role') as string,
    };
    try {
      if (editingItem) {
        const { password, ...updateData } = data;
        await API.put(`/admin/users/${editingItem.id}`, password ? data : updateData);
      } else {
        await API.post('/admin/users', data);
      }
      closeModal();
      refetchUsers();
      refetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (item: any = null) => {
    setEditingItem(item);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const tabs: { id: TabId; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { id: 'products', name: 'Products', icon: FolderDot },
    { id: 'categories', name: 'Categories', icon: FolderDot },
    { id: 'coupons', name: 'Coupons', icon: Tag },
    { id: 'combos', name: 'Combos', icon: Gift },
    { id: 'users', name: 'Users', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-night-border pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-night-ink">Console Dashboard</h1>
          <p className="text-night-ink-soft text-xs mt-1">Configure products, categories, coupons, and orders.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  closeModal();
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  active ? 'bg-brand text-white shadow-md' : 'bg-night-elevated border border-night-border text-night-ink-soft hover:bg-night-border'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <AdminDashboardTab
          statsData={statsData}
          comparisonAnalytics={comparisonAnalytics}
          cakeAnalytics={cakeAnalytics}
          comboAnalytics={comboAnalytics}
          statsError={statsError}
          analyticsError={cakeAnalyticsError || comboAnalyticsError || comparisonError}
        />
      )}

      {activeTab === 'orders' && (
        <AdminOrdersTab
          ordersData={ordersData}
          refetchOrders={refetchOrders}
          handleStatusChange={handleStatusChange}
          handlePaymentChange={handlePaymentChange}
          ordersError={ordersError}
        />
      )}

      {activeTab === 'products' && (
        <AdminProductsTab
          productsData={productsData}
          categoriesData={categoriesData}
          refetchProducts={refetchProducts}
          openModal={openModal}
          handleProductSubmit={handleProductSubmit}
          handleDelete={handleDelete}
          showModal={showModal}
          editingItem={editingItem}
          onClose={closeModal}
          productsError={productsError}
        />
      )}

      {activeTab === 'categories' && (
        <AdminCategoriesTab
          categoriesData={categoriesData}
          refetchCategories={refetchCategories}
          openModal={openModal}
          handleCategorySubmit={handleCategorySubmit}
          handleDelete={handleDelete}
          showModal={showModal}
          editingItem={editingItem}
          onClose={closeModal}
          categoriesError={categoriesError}
        />
      )}

      {activeTab === 'coupons' && (
        <AdminCouponsTab
          couponsData={couponsData}
          refetchCoupons={refetchCoupons}
          openModal={openModal}
          handleCouponSubmit={handleCouponSubmit}
          handleDelete={handleDelete}
          showModal={showModal}
          editingItem={editingItem}
          onClose={closeModal}
          couponsError={couponsError}
        />
      )}

      {activeTab === 'combos' && (
        <AdminCombosTab
          combosData={combosData}
          refetchCombos={refetchCombos}
          openModal={openModal}
          handleComboSubmit={handleComboSubmit}
          handleDelete={handleDelete}
          showModal={showModal}
          editingItem={editingItem}
          onClose={closeModal}
          combosError={combosError}
        />
      )}

      {activeTab === 'users' && (
        <AdminUsersTab
          usersData={usersData}
          refetchUsers={refetchUsers}
          openModal={openModal}
          handleUserSubmit={handleUserSubmit}
          handleDelete={handleDelete}
          showModal={showModal}
          editingItem={editingItem}
          onClose={closeModal}
          usersError={usersError}
        />
      )}
    </div>
  );
}
