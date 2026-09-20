export const WORD_PRESETS = [
  { category: 'Beverages', citizenWord: 'Coffee', intruderWord: 'Tea' },
  { category: 'Nature', citizenWord: 'Ocean', intruderWord: 'Lake' },
  { category: 'Animals', citizenWord: 'Tiger', intruderWord: 'Lion' },
  { category: 'Music', citizenWord: 'Violin', intruderWord: 'Guitar' },
  { category: 'Astronomy', citizenWord: 'Sun', intruderWord: 'Moon' },
  { category: 'Food', citizenWord: 'Pizza', intruderWord: 'Burger' },
  { category: 'Tech', citizenWord: 'Laptop', intruderWord: 'Tablet' },
  { category: 'Professions', citizenWord: 'Doctor', intruderWord: 'Nurse' },
  { category: 'Vehicles', citizenWord: 'Bicycle', intruderWord: 'Motorcycle' },
  { category: 'Footwear', citizenWord: 'Sneakers', intruderWord: 'Boots' },
  { category: 'Weather', citizenWord: 'Rain', intruderWord: 'Snow' },
  { category: 'Sports', citizenWord: 'Soccer', intruderWord: 'Basketball' },
  { category: 'Dessert', citizenWord: 'Ice Cream', intruderWord: 'Frozen Yogurt' },
  { category: 'Time', citizenWord: 'Watch', intruderWord: 'Clock' },
  { category: 'Furniture', citizenWord: 'Sofa', intruderWord: 'Armchair' },
  { category: 'Space', citizenWord: 'Planet', intruderWord: 'Asteroid' },
  { category: 'Art', citizenWord: 'Painting', intruderWord: 'Photograph' },
  { category: 'Fruit', citizenWord: 'Apple', intruderWord: 'Pear' },
  { category: 'Clothing', citizenWord: 'Jacket', intruderWord: 'Sweater' },
  { category: 'Mythology', citizenWord: 'Dragon', intruderWord: 'Dinosaur' },
];

export function getRandomWordPreset() {
  const index = Math.floor(Math.random() * WORD_PRESETS.length);
  return WORD_PRESETS[index];
}
