export const UserRoles = {
  ADMIN: 'admin',
  SUPERUSER: 'superuser',
  USER: 'user',
};

// Initialize test users if not exists
export const initializeUsers = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.length === 0) {
    const testUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123', // In a real app, this should be hashed
        role: UserRoles.ADMIN,
        name: 'Administrator'
      },
      {
        id: 2,
        username: 'super',
        password: 'super123',
        role: UserRoles.SUPERUSER,
        name: 'Super User'
      },
      {
        id: 3,
        username: 'user1',
        password: 'user123',
        role: UserRoles.USER,
        name: 'Regular User 1'
      },
      {
        id: 4,
        username: 'user2',
        password: 'user123',
        role: UserRoles.USER,
        name: 'Regular User 2'
      }
    ];
    
    localStorage.setItem('users', JSON.stringify(testUsers));
  }
};

export const createUser = (userData) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const newUser = {
    id: users.length + 1,
    ...userData,
  };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
};

export const getUsers = () => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const getUserById = (id) => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

export const updateUser = (id, updates) => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem('users', JSON.stringify(users));
    return users[index];
  }
  return null;
};

export const deleteUser = (id) => {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  localStorage.setItem('users', JSON.stringify(filteredUsers));
};
