export const headerLinks = [
  {
    label: 'Home',
    route: '/',
    public: true,
  },
  {
    label: 'Explore',
    route: '/explore',
    public: true,
  },
  {
    label: 'Create Event',
    route: '/events/create',
    requiresAuth: true,
    requiresHost: true,
  },
  {
    label: 'My Profile',
    route: '/profile',
    requiresAuth: true,
  },
]

export const eventDefaultValues = {
  title: '',
  description: '',
  location: '',
  imageUrl: '',
  startDateTime: new Date(),
  endDateTime: new Date(),
  categoryId: '',
  price: '',
  isFree: false,
  url: '',
  isPublic: false,
}
