import { Provider, CareCategory, ServiceDescription, Review } from '../types';

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 1,
    name: 'Ana García',
    photoUrl: '/resources/images/image_mockData_001.avif',
    categories: [CareCategory.ELDERLY, CareCategory.CHILDREN],
    coordinates: { latitude: 40.4168, longitude: -3.7038 },
    distance: 0,
    rating: 4.7,
    reviewsCount: 3,
    descriptions: [
      { category: CareCategory.ELDERLY, text: 'Como enfermera con 10 años de experiencia geriátrica, ofrezco cuidados médicos especializados, gestión de medicación y un trato compasivo.' },
      { category: CareCategory.CHILDREN, text: 'Con experiencia pediátrica, brindo un cuidado infantil seguro y estimulante. Paciente y profesional, creo un entorno de confianza para los más pequeños.' }
    ],
    services: ['Gestión de Medicamentos', 'Compañía', 'Asistencia en Movilidad', 'Canguro'],
    hourlyRate: 15,
    location: 'Centro, Madrid',
    verifications: ['DNI Verificado', 'Certificado de Primeros Auxilios', 'Referencias Comprobadas'],
    reviews: [
        { id: 1, authorName: 'Lucía M.', authorPhotoUrl: '/resources/images/image_mockData_007.jpeg', rating: 5, comment: 'Ana es maravillosa. Mi madre la adora. Es puntual, profesional y muy cariñosa. Totalmente recomendable.', date: 'Hace 1 semana' },
        { id: 2, authorName: 'Javier P.', authorPhotoUrl: '/resources/images/image_mockData_008.jpeg', rating: 5, comment: 'Contraté a Ana para cuidar de mis hijos y no puedo estar más contento. Es creativa, responsable y los niños se lo pasan genial con ella.', date: 'Hace 3 semanas' },
        { id: 3, authorName: 'Carmen R.', authorPhotoUrl: '/resources/images/image_mockData_009.jpeg', rating: 4, comment: 'Muy buena profesional, aunque a veces es un poco difícil contactar con ella por la alta demanda que tiene. Por lo demás, todo perfecto.', date: 'Hace 1 mes' }
    ]
  },
  {
    id: 2,
    name: 'Carlos Rodriguez',
    photoUrl: '/resources/images/image_mockData_002.avif',
    categories: [CareCategory.CHILDREN],
    coordinates: { latitude: 40.4339, longitude: -3.7035 },
    distance: 0,
    rating: 4.5,
    reviewsCount: 2,
    descriptions: [
      { category: CareCategory.CHILDREN, text: 'Educador infantil certificado. Me encanta crear actividades divertidas y educativas que fomenten el desarrollo de los más pequeños. ¡La seguridad es mi prioridad!' }
    ],
    services: ['Tutorías', 'Recogida del colegio', 'Preparación de meriendas', 'Juegos creativos'],
    hourlyRate: 12,
    location: 'Chamberí, Madrid',
    verifications: ['DNI Verificado', 'Certificado de Antecedentes Penales'],
    reviews: [
        { id: 4, authorName: 'Beatriz G.', authorPhotoUrl: '/resources/images/image_mockData_010.jpeg', rating: 5, comment: 'Carlos es un profesor fantástico. Mi hijo ha mejorado mucho en matemáticas gracias a él. Es paciente y sabe cómo motivar a los niños.', date: 'Hace 2 semanas' },
        { id: 5, authorName: 'David S.', authorPhotoUrl: '/resources/images/image_mockData_011.jpeg', rating: 4, comment: 'Buen servicio de recogida del colegio. Siempre puntual. A mi hija le cae muy bien.', date: 'Hace 1 mes' },
    ]
  },
  {
    id: 3,
    name: 'Laura Fernandez',
    photoUrl: '/resources/images/image_mockData_003.avif',
    categories: [CareCategory.PETS],
    coordinates: { latitude: 40.4154, longitude: -3.6844 },
    distance: 0,
    rating: 5.0,
    reviewsCount: 2,
    descriptions: [
      { category: CareCategory.PETS, text: 'Técnica veterinaria y amante de los animales de toda la vida. Especializada en paseos de perros, cuidado a domicilio y administración de medicamentos.' }
    ],
    services: ['Paseo de Perros', 'Cuidado a Domicilio', 'Administración de Medicamentos'],
    hourlyRate: 10,
    location: 'Retiro, Madrid',
    verifications: ['DNI Verificado', 'Referencias Comprobadas', 'Formación Veterinaria'],
    reviews: [
      { id: 6, authorName: 'Marta V.', authorPhotoUrl: '/resources/images/image_mockData_012.jpeg', rating: 5, comment: 'Laura es la mejor cuidadora que podría desear para mis dos perros. Se nota que le apasionan los animales y ellos la adoran. Confianza 100%.', date: 'Hace 5 días' },
      { id: 7, authorName: 'Sergio L.', authorPhotoUrl: '/resources/images/image_mockData_013.jpeg', rating: 5, comment: 'Impecable. Cuidó de mi gato mientras estaba de vacaciones y me mantuvo informado con fotos todos los días. Un servicio de 10.', date: 'Hace 1 mes' }
    ]
  },
  {
    id: 4,
    name: 'David Martinez',
    photoUrl: '/resources/images/image_mockData_004.avif',
    categories: [CareCategory.ELDERLY],
    coordinates: { latitude: 40.4284, longitude: -3.6778 },
    distance: 0,
    rating: 4.0,
    reviewsCount: 1,
    descriptions: [
      { category: CareCategory.ELDERLY, text: 'Cuidador amable y responsable, enfocado en proporcionar una excelente compañía y asistencia en las tareas diarias para mejorar la calidad de vida de las personas mayores.' }
    ],
    services: ['Compras', 'Tareas Domésticas Ligeras', 'Compañía y Conversación'],
    hourlyRate: 13,
    location: 'Salamanca, Madrid',
    verifications: ['DNI Verificado', 'Certificado de Antecedentes Penales'],
    reviews: [
      { id: 8, authorName: 'Elena F.', authorPhotoUrl: '/resources/images/image_mockData_020.jpeg', rating: 4, comment: 'David es muy amable y servicial. Ayudó a mi padre con las compras y le hizo mucha compañía. Un gran apoyo para la familia.', date: 'Hace 2 meses' }
    ]
  },
  {
    id: 5,
    name: 'Sofia Lopez',
    photoUrl: '/resources/images/profile_image.avif',
    categories: [CareCategory.CHILDREN],
    coordinates: { latitude: 40.3995, longitude: -3.7022 },
    distance: 0,
    rating: 4.8,
    reviewsCount: 2,
    descriptions: [
      { category: CareCategory.CHILDREN, text: 'Estudiante de pedagogía con amplia experiencia en el cuidado de niños de todas las edades. Certificada en RCP y primeros auxilios. Creativa y muy paciente.' }
    ],
    services: ['Canguro', 'Ayuda con los Deberes', 'Juego Creativo'],
    hourlyRate: 11,
    location: 'Arganzuela, Madrid',
    verifications: ['DNI Verificado', 'Certificado de Primeros Auxilios'],
    reviews: [
      { id: 9, authorName: 'Pablo N.', authorPhotoUrl: '/resources/images/image_mockData_020.jpeg', rating: 5, comment: 'Sofía es una canguro excepcional. Mis hijos la adoran. Es puntual, responsable y siempre viene con ideas de juegos nuevos.', date: 'Hace 3 semanas' },
      { id: 10, authorName: 'Cristina A.', authorPhotoUrl: '/resources/images/image_mockData_019.jpeg', rating: 4.5, comment: 'Muy contentos con Sofía. Nos ha salvado en más de una ocasión con poca antelación. Muy profesional.', date: 'Hace 1 mes' },
    ]
  },
  {
    id: 6,
    name: 'Javier Perez',
    photoUrl: '/resources/images/image_mockData_005.avif',
    categories: [CareCategory.PETS, CareCategory.ELDERLY],
    coordinates: { latitude: 40.4337, longitude: -3.7155 },
    distance: 0,
    rating: 4.5,
    reviewsCount: 2,
    descriptions: [
      { category: CareCategory.PETS, text: 'Amante de los animales, ofrezco paseos largos y alojamiento en un hogar con jardín. Tu mascota estará en las mejores manos.' },
      { category: CareCategory.ELDERLY, text: 'Ofrezco compañía y asistencia en tareas diarias para personas mayores. Soy responsable, puntual y tengo una gran capacidad de escucha.' }
    ],
    services: ['Alojamiento de Perros', 'Cuidado de Gatos', 'Paseos Diarios', 'Compañía'],
    hourlyRate: 14,
    location: 'Moncloa, Madrid',
    verifications: ['DNI Verificado', 'Referencias Comprobadas'],
    reviews: [
      { id: 11, authorName: 'Raquel G.', authorPhotoUrl: '/resources/images/image_mockData_018.jpeg', rating: 5, comment: 'Javier cuidó de mi perro "Rocky" durante un fin de semana y todo fue genial. Me mandó fotos y se notaba que Rocky estaba feliz. Repetiré sin duda.', date: 'Hace 1 mes' },
      { id: 12, authorName: 'Fernando T.', authorPhotoUrl: '/resources/images/image_mockData_017.jpeg', rating: 4, comment: 'Buen conversador y muy atento con mi abuelo. Un gran servicio de compañía.', date: 'Hace 3 meses' }
    ]
  },
    {
    id: 7,
    name: 'Isabel Torres',
    photoUrl: '/resources/images/image_mockData_021.avif',
    categories: [CareCategory.ELDERLY],
    coordinates: { latitude: 40.4005, longitude: -3.7441 },
    distance: 0,
    rating: 4.8,
    reviewsCount: 2,
    descriptions: [
        { category: CareCategory.ELDERLY, text: 'Dedicada a ayudar a las personas mayores a vivir de forma cómoda e independiente en su propio hogar. Cuento con formación específica en movilización y cuidado personal.' }
    ],
    services: ['Cuidado Personal', 'Preparación de Comidas', 'Recados'],
    hourlyRate: 14,
    location: 'Latina, Madrid',
    verifications: ['DNI Verificado', 'Certificado de Profesionalidad'],
    reviews: [
        { id: 13, authorName: 'Sonia H.', authorPhotoUrl: '/resources/images/image_mockData_016.jpeg', rating: 5, comment: 'Isabel es una profesional excepcional. Su ayuda con mi abuela ha sido inestimable. Su trato es humano y cercano, y técnicamente es impecable.', date: 'Hace 2 semanas' },
        { id: 14, authorName: 'Andrés V.', authorPhotoUrl: '/resources/images/image_mockData_015.jpeg', rating: 4.5, comment: 'Muy contentos con el servicio. Isabel es muy organizada y prepara comidas muy saludables.', date: 'Hace 1 mes' },
    ]
  },
  {
    id: 8,
    name: 'Miguel Sanchez',
    photoUrl: '/resources/images/image_mockData_006.avif',
    categories: [CareCategory.CHILDREN],
    coordinates: { latitude: 40.4190, longitude: -3.7010 },
    distance: 0,
    rating: 5.0,
    reviewsCount: 1,
    descriptions: [
        { category: CareCategory.CHILDREN, text: 'Padre de dos hijos con pasión por el cuidado infantil. Disponible los fines de semana. Me encanta organizar actividades deportivas y al aire libre.' }
    ],
    services: ['Canguro de Fin de Semana', 'Actividades Deportivas', 'Lectura de Cuentos'],
    hourlyRate: 13,
    location: 'Centro, Madrid',
    verifications: ['DNI Verificado', 'Padre con Experiencia'],
    reviews: [
        { id: 15, authorName: 'Laura J.', authorPhotoUrl: '/resources/images/image_mockData_014.jpeg', rating: 5, comment: 'Miguel ha sido un descubrimiento. Cuidó de nuestros hijos el sábado y volvieron encantados contando todas las aventuras que habían vivido en el parque. ¡Repetiremos seguro!', date: 'Hace 1 semana' },
    ]
  }
];