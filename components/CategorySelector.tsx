import React from 'react';
import { CareCategory } from '../types';

interface CategorySelectorProps {
  selectedCategory: CareCategory | 'all';
  onSelectCategory: (category: CareCategory | 'all') => void;
}

const categories: { id: CareCategory, name: string, icon: string }[] = [
  { id: CareCategory.ELDERLY, name: 'Mayores', icon: '/resources/icons/elderly-female-icon.svg' },
  { id: CareCategory.CHILDREN, name: 'Niños', icon: '/resources/icons/baby-girl-icon.svg' },
  { id: CareCategory.PETS, name: 'Mascotas', icon: '/resources/icons/dog-puppy-face-icon.svg' },
  { id: CareCategory.HOUSEKEEPING, name: 'Limpieza', icon: '/resources/icons/housekeeping-icon.svg' },
];

const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="bg-white/90 backdrop-blur-lg pt-2 pb-3 border-b border-slate-200 sticky top-[64px] z-30">
        <div className="container mx-auto px-4 flex items-center space-x-3 overflow-x-auto">
            <button
                onClick={() => onSelectCategory('all')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors flex-shrink-0
                ${selectedCategory === 'all'
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
                Todos
            </button>

            {categories.map((cat) => (
                <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 transform hover:scale-110
                    ${selectedCategory === cat.id
                    ? 'bg-teal-500 shadow-lg shadow-teal-500/50'
                    : 'bg-white hover:bg-slate-50 shadow-md'
                    }`}
                title={cat.name}
                >
                <img 
                    src={cat.icon} 
                    alt={cat.name}
                    className={`w-8 h-8 transition-all duration-300
                        ${selectedCategory === cat.id ? 'brightness-0 invert' : 'opacity-70'}
                    `}
                />
                </button>
            ))}
        </div>
    </div>
  );
};

export default CategorySelector;