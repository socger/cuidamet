import { Provider, CareCategory, ServiceDescription, Review } from '../types';

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 1,
    name: 'Ana García',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
    categories: [CareCategory.ELDERLY, CareCategory.CHILDREN],
    coordinates: { latitude: 40.4168, longitude: -3.7038 },
    distance: 0,
    rating: 4.9,
    reviewsCount: 34,
    isPremium: true,
    status: 'available',
    languages: ['Español', 'Inglés'],
    availability: ['Mañanas', 'Tardes', 'Fines de Semana'],
    descriptions: [
      { category: CareCategory.ELDERLY, text: 'Como enfermera con 10 años de experiencia geriátrica, ofrezco cuidados médicos especializados, gestión de medicación y un trato compasivo.' },
      { category: CareCategory.CHILDREN, text: 'Con experiencia pediátrica, brindo un cuidado infantil seguro y estimulante. Paciente y profesional, creo un entorno de confianza para los más pequeños.' }
    ],
    services: ['Gestión de Medicamentos', 'Compañía', 'Asistencia en Movilidad', 'Canguro'],
    hourlyRate: 15,
    detailedRates: {
        [CareCategory.ELDERLY]: { hourly: 15, shift: 100, urgentSurcharge: 20 },
        [CareCategory.CHILDREN]: { hourly: 12, shift: 80, urgentSurcharge: 15 },
        [CareCategory.PETS]: { hourly: 0 },
        [CareCategory.HOUSEKEEPING]: { hourly: 0 }
    },
    specificTraining: {
        [CareCategory.ELDERLY]: 'Máster en Geriatría, Curso de Alzheimer y Demencias.'
    },
    medicalSkills: ['Alzheimer', 'Parkinson', 'Diabetes', 'Movilidad Reducida', 'Post-operatorio'],
    location: 'Centro, Madrid',
    verifications: ['DNI Verificado', 'Certificado de Primeros Auxilios', 'Referencias Comprobadas'],
    reviews: [
        { id: 1, authorName: 'Lucía M.', authorPhotoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200', rating: 5, comment: 'Ana es maravillosa. Mi madre la adora. Es puntual, profesional y muy cariñosa. Totalmente recomendable.', date: 'Hace 1 semana' },
        { id: 2, authorName: 'Javier P.', authorPhotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200', rating: 5, comment: 'Contraté a Ana para cuidar de mis hijos y no puedo estar más contento. Es creativa, responsable y los niños se lo pasan genial con ella.', date: 'Hace 3 semanas' },
        { id: 3, authorName: 'Carmen R.', authorPhotoUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=200', rating: 4, comment: 'Muy buena profesional, aunque a veces es un poco difícil contactar con ella por la alta demanda que tiene. Por lo demás, todo perfecto.', date: 'Hace 1 mes' }
    ],
    badges: ['Premium', 'Mejor Valorado', 'Respuesta Rápida']
  },
  {
    id: 2,
    name: 'Carlos Rodriguez',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    categories: [CareCategory.CHILDREN],
    coordinates: { latitude: 40.4339, longitude: -3.7035 },
    distance: 0,
    rating: 4.5,
    reviewsCount: 18,
    status: 'busy',
    languages: ['Español', 'Francés'],
    availability: ['Tardes'],
    descriptions: [
      { category: CareCategory.CHILDREN, text: 'Educador infantil certificado. Me encanta crear actividades divertidas y educativas que fomenten el desarrollo de los más pequeños. ¡La seguridad es mi prioridad!' }
    ],
    services: ['Tutorías', 'Recogida del colegio', 'Preparación de meriendas', 'Juegos creativos'],
    hourlyRate: 12,
    detailedRates: {
        [CareCategory.CHILDREN]: { hourly: 12, urgentSurcharge: 10 },
        [CareCategory.ELDERLY]: { hourly: 0 },
        [CareCategory.PETS]: { hourly: 0 },
        [CareCategory.HOUSEKEEPING]: { hourly: 0 }
    },
    medicalSkills: ['Primeros Auxilios Pediátricos', 'TDAH', 'Autismo Leve'],
    location: 'Chamberí, Madrid',
    verifications: ['DNI Verificado', 'Certificado de Antecedentes Penales'],
    reviews: [
        { id: 4, authorName: 'Beatriz G.', authorPhotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200', rating: 5, comment: 'Carlos es un profesor fantástico. Mi hijo ha mejorado mucho en matemáticas gracias a él. Es paciente y sabe cómo motivar a los niños.', date: 'Hace 2 semanas' },
        { id: 5, authorName: 'David S.', authorPhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200', rating: 4, comment: 'Buen servicio de recogida del colegio. Siempre puntual. A mi hija le cae muy bien.', date: 'Hace 1 mes' },
    ]
  },
  {
    id: 3,
    name: 'Laura Fernandez',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    categories: [CareCategory.PETS],
    coordinates: { latitude: 40.4154, longitude: -3.6844 },
    distance: 0,
    rating: 5.0,
    reviewsCount: 42,
    isPremium: true,
    status: 'available',
    languages: ['Español'],
    availability: ['Mañanas', 'Tardes', 'Noches'],
    descriptions: [
      { category: CareCategory.PETS, text: 'Técnica veterinaria y amante de los animales de toda la vida. Especializada en paseos de perros, cuidado a domicilio y administración de medicamentos.' }
    ],
    services: ['Paseo de Perros', 'Cuidado a Domicilio', 'Administración de Medicamentos'],
    hourlyRate: 10,
    detailedRates: {
        [CareCategory.PETS]: { hourly: 10, urgentSurcharge: 50, extras: [{name: 'Baño', price: 15}] },
        [CareCategory.ELDERLY]: { hourly: 0 },
        [CareCategory.CHILDREN]: { hourly: 0 },
        [CareCategory.HOUSEKEEPING]: { hourly: 0 }
    },
    petAttributes: {
        acceptedPets: ['Perros', 'Gatos', 'Pequeños animales'],
        workZones: ['A domicilio', 'En casa del cuidador'],
        maxPets: 3
    },
    location: 'Retiro, Madrid',
    verifications: ['DNI Verificado', 'Referencias Comprobadas', 'Formación Veterinaria'],
    reviews: [
      { id: 6, authorName: 'Marta V.', authorPhotoUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=200', rating: 5, comment: 'Laura es la mejor cuidadora que podría desear para mis dos perros. Se nota que le apasionan los animales y ellos la adoran. Confianza 100%.', date: 'Hace 5 días' },
      { id: 7, authorName: 'Sergio L.', authorPhotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200', rating: 5, comment: 'Impecable. Cuidó de mi gato mientras estaba de vacaciones y me mantuvo informado con fotos todos los días. Un servicio de 10.', date: 'Hace 1 mes' }
    ],
    badges: ['Premium', 'Experta en Mascotas']
  },
  {
    id: 4,
    name: 'David Martinez',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    categories: [CareCategory.ELDERLY, CareCategory.HOUSEKEEPING],
    coordinates: { latitude: 40.4284, longitude: -3.6778 },
    distance: 0,
    rating: 4.0,
    reviewsCount: 8,
    status: 'offline',
    languages: ['Español', 'Inglés'],
    availability: ['Mañanas'],
    descriptions: [
      { category: CareCategory.ELDERLY, text: 'Cuidador amable y responsable, enfocado en proporcionar una excelente compañía y asistencia en las tareas diarias para mejorar la calidad de vida de las personas mayores.' },
      { category: CareCategory.HOUSEKEEPING, text: 'También ofrezco servicios de limpieza general del hogar y pequeñas reparaciones.' }
    ],
    services: ['Compras', 'Tareas Domésticas Ligeras', 'Compañía y Conversación', 'Limpieza general'],
    hourlyRate: 13,
    medicalSkills: ['Acompañamiento', 'Gestión de Citas'],
    housekeepingAttributes: {
        products: 'flexible',
        equipment: false,
        waste: false,
        eco: false
    },
    location: 'Salamanca, Madrid',
    verifications: ['DNI Verificado', 'Certificado de Antecedentes Penales'],
    reviews: [
      { id: 8, authorName: 'Elena F.', authorPhotoUrl: 'https://images.unsplash.com/photo-1542596768-5d1d6bf6cf52?q=80&w=200', rating: 4, comment: 'David es muy amable y servicial. Ayudó a mi padre con las compras y le hizo mucha compañía. Un gran apoyo para la familia.', date: 'Hace 2 meses' }
    ]
  },
];
