import { Doctor, Medicine, Hospital } from '../types';

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiologist',
    profilePic: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.9,
    experience: 12,
    consultationFee: 150,
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialization: 'Neurologist',
    profilePic: 'https://images.pexels.com/photos/6627437/pexels-photo-6627437.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    experience: 15,
    consultationFee: 200,
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialization: 'Dermatologist',
    profilePic: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.7,
    experience: 8,
    consultationFee: 120,
  },
];

export const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 12.99,
    description: 'Pain relief and fever reducer',
    dosage: 'Take 1-2 tablets every 4-6 hours',
  },
  {
    id: '2',
    name: 'Vitamin D3',
    image: 'https://images.pexels.com/photos/4021769/pexels-photo-4021769.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 24.99,
    description: 'Bone health supplement',
    dosage: 'Take 1 tablet daily with food',
  },
  {
    id: '3',
    name: 'Omega-3 Fish Oil',
    image: 'https://images.pexels.com/photos/3652097/pexels-photo-3652097.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 18.99,
    description: 'Heart and brain health',
    dosage: 'Take 2 capsules daily',
  },
];

export const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'City General Hospital',
    address: '123 Main Street, Downtown',
    image: 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=400',
    distance: 2.5,
    rating: 4.6,
    phone: '+1-555-0123',
    lat: 40.7128,
    lng: -74.0060,
  },
  {
    id: '2',
    name: 'Memorial Medical Center',
    address: '456 Oak Avenue, Midtown',
    image: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=400',
    distance: 4.2,
    rating: 4.8,
    phone: '+1-555-0124',
    lat: 40.7589,
    lng: -73.9851,
  },
  {
    id: '3',
    name: 'St. Mary\'s Hospital',
    address: '789 Pine Road, Uptown',
    image: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=400',
    distance: 6.1,
    rating: 4.5,
    phone: '+1-555-0125',
    lat: 40.7831,
    lng: -73.9712,
  },
];