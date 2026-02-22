const testUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrator'
  },
  {
    id: 2,
    username: 'super',
    password: 'super123',
    role: 'superuser',
    name: 'Super User'
  },
  {
    id: 3,
    username: 'user1',
    password: 'user123',
    role: 'user',
    name: 'Regular User 1'
  },
  {
    id: 4,
    username: 'user2',
    password: 'user123',
    role: 'user',
    name: 'Regular User 2'
  }
];

// Initialize test users in localStorage
localStorage.setItem('users', JSON.stringify(testUsers));
