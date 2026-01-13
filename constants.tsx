
import React from 'react';
import { Droplets, Car, Sparkles, ShieldCheck } from 'lucide-react';

export const WASH_TYPES = [
  { id: 'simples', name: 'Simples', icon: <Car size={18} />, basePrice: 40 },
  { id: 'completa', name: 'Completa', icon: <Droplets size={18} />, basePrice: 60 },
  { id: 'higienizacao', name: 'Higienização', icon: <Sparkles size={18} />, basePrice: 150 },
  { id: 'ceras', name: 'Ceras/Proteção', icon: <ShieldCheck size={18} />, basePrice: 100 },
];

export const CLOUD_POLLING_INTERVAL = 4000; // 4 seconds
