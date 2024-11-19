import { Category } from '../types';
import { 
  ShoppingCart, 
  Home, 
  Car, 
  Utensils, 
  Plane, 
  Heart, 
  Wifi,
  Smartphone
} from 'lucide-react';

export const defaultCategories: Category[] = [
  { id: '1', name: 'Shopping', color: '#FF6B6B', icon: ShoppingCart.name },
  { id: '2', name: 'Housing', color: '#4ECDC4', icon: Home.name },
  { id: '3', name: 'Transport', color: '#45B7D1', icon: Car.name },
  { id: '4', name: 'Food', color: '#96CEB4', icon: Utensils.name },
  { id: '5', name: 'Travel', color: '#FFEEAD', icon: Plane.name },
  { id: '6', name: 'Healthcare', color: '#D4A5A5', icon: Heart.name },
  { id: '7', name: 'Internet', color: '#9B97B2', icon: Wifi.name },
  { id: '8', name: 'Phone', color: '#A8E6CF', icon: Smartphone.name },
];