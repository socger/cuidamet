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
    <div className="bg-transparent pt-2 pb-3 sticky top-[64px] z-30">
        <div className="container mx-auto px-4 flex items-center space-x-3 overflow-x-auto">
            <button
                onClick={() => onSelectCategory('all')}
                className={`p-2 md:p-3 rounded-full transition-all duration-300 flex-shrink-0 transform hover:scale-110
                    ${selectedCategory === 'all'
                    ? 'bg-teal-500 shadow-lg shadow-teal-500/50'
                    : 'bg-white hover:bg-slate-50 shadow-md'
                    }`}
                title="Todos"
            >
                <img 
                    src="/resources/icons/remove-filter-icon.svg" 
                    alt="Todos"
                    className={`w-6 h-6 md:w-8 md:h-8 transition-all duration-300
                        ${selectedCategory === 'all' ? 'brightness-0 invert' : 'opacity-70'}
                    `}
                />
            </button>

            {categories.map((cat) => (
                <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`p-2 md:p-3 rounded-full transition-all duration-300 flex-shrink-0 transform hover:scale-110
                    ${selectedCategory === cat.id
                    ? 'bg-teal-500 shadow-lg shadow-teal-500/50'
                    : 'bg-white hover:bg-slate-50 shadow-md'
                    }`}
                title={cat.name}
                >
                <img 
                    src={cat.icon} 
                    alt={cat.name}
                    className={`w-6 h-6 md:w-8 md:h-8 transition-all duration-300
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